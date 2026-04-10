import crypto from 'crypto';
import { Router } from 'express';

import pool from '../db/pool.js';
import { getFrontendUrl, getLinkedInRedirectUri } from '../lib/public-url.js';
import { authenticate } from '../middleware/auth.js';
import { decryptSecret, encryptSecret } from '../services/linkedin/crypto.js';
import {
  buildLinkedInAuthUrl,
  buildPersonUrn,
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  readLinkedInState,
  signLinkedInState,
} from '../services/linkedin/oauth.js';
import {
  mapLinkedInConnectionStatus,
  normalizeLinkedInPublishError,
  publishLinkedInTextPost,
} from '../services/linkedin/publish.js';

const router = Router();

router.get('/callback', async (req, res) => {
  const frontendUrl = getFrontendUrl(req);

  try {
    const { code, error, state } = req.query;
    if (error || !code || !state) {
      return res.redirect(buildLinkedInFrontendRedirect(frontendUrl, 'error'));
    }

    const statePayload = readLinkedInState(state);
    const workspace = await getOrCreateWorkspace(statePayload.userId);
    const redirectUri = getLinkedInRedirectUri(req);
    const tokenData = await exchangeLinkedInCode({
      code,
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      redirectUri,
    });
    const profile = await fetchLinkedInUserInfo({ accessToken: tokenData.access_token });
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + (Number(tokenData.expires_in) * 1000)).toISOString()
      : null;

    await pool.query(
      `INSERT INTO linkedin_connections (
        user_id, workspace_id, linkedin_member_id, linkedin_display_name, linkedin_email, person_urn,
        access_token_encrypted, refresh_token_encrypted, scope, token_type, expires_at,
        last_validated_at, connection_status, connected_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),'connected',NOW(),NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET workspace_id = EXCLUDED.workspace_id,
          linkedin_member_id = EXCLUDED.linkedin_member_id,
          linkedin_display_name = EXCLUDED.linkedin_display_name,
          linkedin_email = EXCLUDED.linkedin_email,
          person_urn = EXCLUDED.person_urn,
          access_token_encrypted = EXCLUDED.access_token_encrypted,
          refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
          scope = EXCLUDED.scope,
          token_type = EXCLUDED.token_type,
          expires_at = EXCLUDED.expires_at,
          last_validated_at = NOW(),
          connection_status = 'connected',
          connected_at = COALESCE(linkedin_connections.connected_at, NOW()),
          updated_at = NOW()`,
      [
        statePayload.userId,
        workspace.id,
        profile.sub,
        profile.name || [profile.given_name, profile.family_name].filter(Boolean).join(' '),
        profile.email || '',
        buildPersonUrn(profile.sub),
        encryptSecret(tokenData.access_token),
        tokenData.refresh_token ? encryptSecret(tokenData.refresh_token) : null,
        tokenData.scope || process.env.LINKEDIN_SCOPES || 'openid profile email w_member_social',
        tokenData.token_type || 'Bearer',
        expiresAt,
      ]
    );

    return res.redirect(buildLinkedInFrontendRedirect(frontendUrl, 'connected'));
  } catch {
    return res.redirect(buildLinkedInFrontendRedirect(frontendUrl, 'error'));
  }
});

router.use(authenticate);

router.get('/status', async (req, res, next) => {
  try {
    const connection = await getLinkedInConnection(req.user.id);
    res.json({ linkedin: mapLinkedInConnectionStatus(connection) });
  } catch (err) {
    next(err);
  }
});

router.get('/connect', async (req, res, next) => {
  try {
    const state = signLinkedInState({
      userId: req.user.id,
      returnTo: '/settings',
      nonce: crypto.randomUUID(),
      issuedAt: new Date().toISOString(),
    });

    res.json({
      authUrl: buildLinkedInAuthUrl({
        clientId: process.env.LINKEDIN_CLIENT_ID,
        redirectUri: getLinkedInRedirectUri(req),
        scope: process.env.LINKEDIN_SCOPES || 'openid profile email w_member_social',
        state,
      }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/disconnect', async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM linkedin_connections WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      linkedin: mapLinkedInConnectionStatus(null),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/publish', async (req, res, next) => {
  const client = await pool.connect();

  try {
    const content = String(req.body?.content || '').trim();
    if (!content) {
      const err = new Error('LinkedIn content is required.');
      err.status = 400;
      throw err;
    }

    const workspace = await getOrCreateWorkspace(req.user.id, client);
    const connection = await getLinkedInConnection(req.user.id, client);
    const linkedin = mapLinkedInConnectionStatus(connection);

    if (!linkedin.canPublish || !connection) {
      const err = new Error('Reconnect LinkedIn in Settings before publishing.');
      err.status = 409;
      throw err;
    }

    const authorUrn = connection.person_urn || buildPersonUrn(connection.linkedin_member_id);
    const accessToken = decryptSecret(connection.access_token_encrypted);
    const publishResult = await publishLinkedInTextPost({
      accessToken,
      authorUrn,
      content,
    });

    const { rows } = await client.query(
      `INSERT INTO linkedin_post_publications (
        user_id, workspace_id, generation_session_id, brand_id, linkedin_connection_id,
        content_text, linkedin_post_urn, status, published_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,'published',NOW())
      RETURNING published_at`,
      [
        req.user.id,
        workspace.id,
        req.body?.generationSessionId || null,
        req.body?.brandId || null,
        connection.id,
        content,
        publishResult.postUrn,
      ]
    );

    await client.query(
      `UPDATE linkedin_connections
       SET last_validated_at = NOW(),
           connection_status = 'connected',
           updated_at = NOW()
       WHERE id = $1`,
      [connection.id]
    );

    if (req.body?.generationSessionId) {
      await client.query(
        `UPDATE generation_sessions
         SET status = 'completed',
             current_step = 'output',
             updated_at = NOW()
         WHERE id = $1 AND user_id = $2 AND status <> 'abandoned'`,
        [req.body.generationSessionId, req.user.id]
      );
    }

    res.json({
      ok: true,
      status: 'published',
      postUrn: publishResult.postUrn,
      publishedAt: rows[0]?.published_at || new Date().toISOString(),
      message: 'Published to LinkedIn.',
    });
  } catch (err) {
    const publishError = normalizeLinkedInPublishError(err);

    try {
      const workspace = await getOrCreateWorkspace(req.user.id, client);
      const connection = await getLinkedInConnection(req.user.id, client);

      if (connection?.id) {
        await client.query(
          `INSERT INTO linkedin_post_publications (
            user_id, workspace_id, generation_session_id, brand_id, linkedin_connection_id,
            content_text, status, failure_code, failure_message
          ) VALUES ($1,$2,$3,$4,$5,$6,'failed',$7,$8)`,
          [
            req.user.id,
            workspace.id,
            req.body?.generationSessionId || null,
            req.body?.brandId || null,
            connection.id,
            String(req.body?.content || '').trim(),
            String(publishError.code || ''),
            String(publishError.message || ''),
          ]
        );

        if (publishError.status === 401 || publishError.status === 403) {
          await client.query(
            `UPDATE linkedin_connections
             SET connection_status = 'expired',
                 expires_at = NOW(),
                 updated_at = NOW()
             WHERE id = $1`,
            [connection.id]
          );
        }
      }
    } catch {
      // Preserve the original failure for the API response.
    }

    err.status = publishError.status || err.status || 500;
    err.message = publishError.message || err.message;
    next(err);
  } finally {
    client.release();
  }
});

async function getLinkedInConnection(userId, client = pool) {
  const result = await client.query(
    'SELECT * FROM linkedin_connections WHERE user_id = $1 LIMIT 1',
    [userId]
  );

  return result.rows[0] || null;
}

async function getOrCreateWorkspace(userId, client = pool) {
  const existing = await client.query('SELECT * FROM workspaces WHERE user_id = $1 LIMIT 1', [userId]);
  if (existing.rows[0]) {
    return existing.rows[0];
  }

  const created = await client.query(
    `INSERT INTO workspaces (user_id, company_name, display_name)
     SELECT id, company_name, company_name
     FROM users
     WHERE id = $1
     RETURNING *`,
    [userId]
  );

  return created.rows[0];
}

function buildLinkedInFrontendRedirect(frontendUrl, status) {
  const url = new URL('/settings', frontendUrl);
  url.searchParams.set('linkedin', status);
  return url.toString();
}

export default router;
