import { Router } from 'express';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { MODEL, PROVIDER, isAIConfigured, testAIConnection } from '../services/ai/client.js';
import { buildWorkspaceIntakeEmail } from '../services/inbound/intakeAddress.js';
import { mapLinkedInConnectionStatus } from '../services/linkedin/publish.js';

const router = Router();
router.use(authenticate);

const INBOX_VIEW_OPTIONS = new Set(['updates', 'threads']);
const CONTENT_FORMAT_OPTIONS = new Set(['linkedin', 'blog', 'both']);
const TONE_STRICTNESS_OPTIONS = new Set(['relaxed', 'balanced', 'strict']);
const OUTPUT_LENGTH_OPTIONS = new Set(['concise', 'standard', 'detailed']);

router.get('/', async (req, res, next) => {
  try {
    const state = await getSettingsState(req.user.id);
    res.json({ settings: buildSettingsResponse(state) });
  } catch (err) {
    next(err);
  }
});

router.patch('/', async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { profile = {}, workspace = {}, inbox = {}, generation = {} } = req.body || {};
    await client.query('BEGIN');

    const current = await getSettingsState(req.user.id, client);

    const nextFirstName = normalizeText(profile.firstName, current.user.first_name);
    const nextLastName = normalizeText(profile.lastName, current.user.last_name);
    const nextCompanyName = normalizeText(profile.companyName, current.user.company_name);
    const nextDisplayName = normalizeNullableText(workspace.displayName, current.workspace.display_name || current.workspace.company_name);

    validateEnum('preferredInboxView', inbox.preferredInboxView, INBOX_VIEW_OPTIONS);
    validateEnum('defaultContentFormat', generation.defaultContentFormat, CONTENT_FORMAT_OPTIONS);
    validateEnum('toneStrictness', generation.toneStrictness, TONE_STRICTNESS_OPTIONS);
    validateEnum('preferredOutputLength', generation.preferredOutputLength, OUTPUT_LENGTH_OPTIONS);

    await client.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           company_name = $3,
           preferred_inbox_view = $4,
           include_original_email = $5,
           forwarding_enabled = $6,
           default_content_format = $7,
           tone_strictness = $8,
           preferred_output_length = $9,
           updated_at = NOW()
       WHERE id = $10`,
      [
        nextFirstName,
        nextLastName,
        nextCompanyName,
        inbox.preferredInboxView ?? current.user.preferred_inbox_view,
        typeof inbox.includeOriginalEmail === 'boolean' ? inbox.includeOriginalEmail : current.user.include_original_email,
        typeof inbox.forwardingEnabled === 'boolean' ? inbox.forwardingEnabled : current.user.forwarding_enabled,
        generation.defaultContentFormat ?? current.user.default_content_format,
        generation.toneStrictness ?? current.user.tone_strictness,
        generation.preferredOutputLength ?? current.user.preferred_output_length,
        req.user.id,
      ]
    );

    await client.query(
      `UPDATE workspaces
       SET company_name = $1,
           display_name = $2
       WHERE id = $3`,
      [
        nextCompanyName,
        nextDisplayName,
        current.workspace.id,
      ]
    );

    await client.query('COMMIT');

    const refreshed = await getSettingsState(req.user.id);
    res.json({ settings: buildSettingsResponse(refreshed) });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.post('/test-ai', async (_req, res) => {
  const startedAt = Date.now();

  try {
    const reply = await testAIConnection();
    res.json({
      ok: true,
      provider: PROVIDER,
      model: MODEL,
      message: reply === 'OK' ? 'Connection successful.' : `Connection successful: ${reply}`,
      latencyMs: Date.now() - startedAt,
    });
  } catch (err) {
    res.json({
      ok: false,
      provider: PROVIDER,
      model: MODEL,
      message: err.message || 'Unable to reach the configured AI provider.',
      latencyMs: Date.now() - startedAt,
    });
  }
});

export function buildSettingsResponse({ user, workspace, brandCount, linkedin }) {
  const intakeDomain = process.env.RESEND_INBOUND_DOMAIN || process.env.INTAKE_EMAIL_DOMAIN;
  const intakeEmail = buildWorkspaceIntakeEmail(workspace.id, intakeDomain);
  const inboundAvailable = Boolean(intakeDomain && process.env.RESEND_API_KEY && process.env.RESEND_WEBHOOK_SECRET);

  return {
    profile: {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      companyName: user.company_name,
    },
    workspace: {
      displayName: workspace.display_name || workspace.company_name,
      companyName: workspace.company_name,
      brandCount,
      onboardingComplete: Boolean(user.onboarding_complete),
      gmailConnectionStatus: workspace.gmail_connection_status || 'not_connected',
    },
    inbox: {
      intakeEmail,
      forwardingEnabled: Boolean(user.forwarding_enabled),
      preferredInboxView: user.preferred_inbox_view || 'updates',
      includeOriginalEmail: user.include_original_email !== false,
      gmailAvailable: inboundAvailable,
      gmailConnectionStatus: workspace.gmail_connection_status || 'not_connected',
    },
    generation: {
      defaultContentFormat: user.default_content_format || 'linkedin',
      toneStrictness: user.tone_strictness || 'balanced',
      preferredOutputLength: user.preferred_output_length || 'standard',
    },
    ai: {
      platformManaged: true,
      configured: isAIConfigured(),
      provider: PROVIDER,
      model: MODEL,
    },
    security: {
      googleConnected: Boolean(user.google_id),
      passwordEnabled: Boolean(user.password_hash),
      ssoEnabled: false,
    },
    linkedin: mapLinkedInConnectionStatus(linkedin),
  };
}

async function getSettingsState(userId, client = pool) {
  const workspace = await getOrCreateWorkspace(userId, client);
  const [userResult, brandCountResult, linkedinResult] = await Promise.all([
    client.query('SELECT * FROM users WHERE id = $1', [userId]),
    client.query('SELECT COUNT(*) AS count FROM brands WHERE workspace_id = $1', [workspace.id]),
    client.query('SELECT * FROM linkedin_connections WHERE user_id = $1 LIMIT 1', [userId]),
  ]);

  return {
    user: userResult.rows[0],
    workspace,
    brandCount: Number(brandCountResult.rows[0]?.count || 0),
    linkedin: linkedinResult.rows[0] || null,
  };
}

async function getOrCreateWorkspace(userId, client = pool) {
  const existing = await client.query('SELECT * FROM workspaces WHERE user_id = $1', [userId]);
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

function normalizeText(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const next = String(value).trim();
  if (!next) {
    const err = new Error('Profile fields cannot be empty.');
    err.status = 400;
    throw err;
  }

  return next;
}

function normalizeNullableText(value, fallback) {
  if (value === undefined) {
    return fallback;
  }

  const next = String(value).trim();
  return next || fallback;
}

function validateEnum(fieldName, value, allowed) {
  if (value === undefined) {
    return;
  }

  if (!allowed.has(value)) {
    const err = new Error(`Invalid ${fieldName} value.`);
    err.status = 400;
    throw err;
  }
}

export default router;
