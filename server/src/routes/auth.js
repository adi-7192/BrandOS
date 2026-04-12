import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { revokeToken } from '../lib/tokenRevocation.js';
import { getIntentState } from '../services/intentSignals.js';
import { getFrontendUrl, getGoogleRedirectUri } from '../lib/public-url.js';

const router = Router();

// ─── JWT ─────────────────────────────────────────────────────────────────────

const sign = (user) => jwt.sign(
  { id: user.id, email: user.email, jti: crypto.randomUUID() },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// ─── Brute-force protection for /signin ──────────────────────────────────────

const signinAttempts = new Map(); // `${ip}:${email}` -> { count, resetAt }
const SIGNIN_WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const SIGNIN_MAX = 10;                    // max attempts before lockout

function signinKey(req) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const email = (req.body?.email || '').toLowerCase();
  return `${ip}:${email}`;
}

function isSigninLimited(req) {
  const key = signinKey(req);
  const now = Date.now();
  let entry = signinAttempts.get(key);
  if (!entry || now > entry.resetAt) entry = { count: 0, resetAt: now + SIGNIN_WINDOW_MS };
  entry.count += 1;
  signinAttempts.set(key, entry);
  return entry.count > SIGNIN_MAX;
}

function clearSigninLimit(req) {
  signinAttempts.delete(signinKey(req));
}

// Prune stale entries every 30 minutes so the Map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of signinAttempts) if (now > v.resetAt) signinAttempts.delete(k);
}, 30 * 60 * 1000).unref();

// ─── Google OAuth CSRF helper ─────────────────────────────────────────────────

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

// GET /api/auth/google  → redirect to Google consent screen
router.get('/google', (req, res) => {
  // Generate a random nonce and store it in an HttpOnly cookie.
  // Google will return it unchanged as `state`, binding the callback
  // to this specific browser session (CSRF protection per RFC 6749 §10.12).
  const nonce = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes — OAuth flows shouldn't take longer
  });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(req),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: nonce,
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// GET /api/auth/google/callback  → exchange code, upsert user, issue JWT
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, error, state } = req.query;
    const frontendUrl = getFrontendUrl(req);
    const googleRedirectUri = getGoogleRedirectUri(req);

    // Verify CSRF state before anything else.
    const cookieState = getCookie(req, 'oauth_state');
    res.clearCookie('oauth_state');
    if (!state || !cookieState || state !== cookieState) {
      return res.redirect(`${frontendUrl}/signin?error=invalid_state`);
    }

    if (error || !code) {
      return res.redirect(`${frontendUrl}/signin?error=google_cancelled`);
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.redirect(`${frontendUrl}/signin?error=google_token_failed`);
    }

    // Fetch Google profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profile.email) {
      return res.redirect(`${frontendUrl}/signin?error=google_no_email`);
    }

    const companyName = profile.hd || profile.email.split('@')[1] || 'My Company';

    // Upsert: find by google_id or email, create if neither exists.
    // We look up by google_id first to avoid a double-conflict INSERT: if the
    // user has logged in with Google before, their row already has both email
    // AND google_id set. Inserting with ON CONFLICT (email) would also hit the
    // google_id unique constraint (which is not the arbiter), causing Postgres
    // to throw a unique-violation error instead of applying the DO UPDATE.
    const firstName = profile.given_name || profile.name?.split(' ')[0] || '';
    const lastName  = profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '';
    const email     = profile.email.toLowerCase();

    let user;
    const existing = await pool.query('SELECT * FROM users WHERE google_id = $1', [profile.id]);
    if (existing.rowCount > 0) {
      user = existing.rows[0];
    } else {
      // First time with this Google account: insert new row or link an existing
      // email/password account (ON CONFLICT on email is safe here because
      // google_id is not yet set on any row).
      const { rows } = await pool.query(
        `INSERT INTO users (first_name, last_name, email, google_id, company_name, workspace_profile_completed)
         VALUES ($1, $2, $3, $4, $5, FALSE)
         ON CONFLICT (email) DO UPDATE
           SET google_id = EXCLUDED.google_id,
               first_name = COALESCE(NULLIF(users.first_name, ''), EXCLUDED.first_name),
               last_name  = COALESCE(NULLIF(users.last_name,  ''), EXCLUDED.last_name)
         RETURNING *`,
        [firstName, lastName, email, profile.id, companyName]
      );
      user = rows[0];
    }

    // Create workspace if this is the first time
    const wsCheck = await pool.query('SELECT id FROM workspaces WHERE user_id = $1', [user.id]);
    if (wsCheck.rowCount === 0) {
      await pool.query('INSERT INTO workspaces (user_id, company_name) VALUES ($1, $2)', [user.id, companyName]);
    }

    const token = sign(user);
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (err) { next(err); }
});

// ─── Email / password ─────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { firstName, lastName, email, companyName, password } = req.body;
    if (!firstName || !lastName || !email || !companyName || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rowCount > 0) return res.status(409).json({ message: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, email, company_name, password_hash, workspace_profile_completed)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [firstName, lastName, email.toLowerCase(), companyName, passwordHash]
    );
    const user = rows[0];

    // Create workspace
    await pool.query('INSERT INTO workspaces (user_id, company_name) VALUES ($1, $2)', [user.id, companyName]);

    res.status(201).json({ token: sign(user), user: await formatUser(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/signin
router.post('/signin', async (req, res, next) => {
  try {
    if (isSigninLimited(req)) {
      return res.status(429).json({ message: 'Too many signin attempts. Please try again later.' });
    }

    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
    if (!user.password_hash) return res.status(401).json({ message: 'Please sign in with SSO.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    clearSigninLimit(req);
    res.json({ token: sign(user), user: await formatUser(user) });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  const { jti, exp } = req.user;
  if (jti && exp) revokeToken(jti, exp);
  res.json({ message: 'Logged out.' });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: await formatUser(rows[0]) });
  } catch (err) { next(err); }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticate, async (req, res, next) => {
  try {
    const { companyName } = req.body;

    if (!companyName?.trim()) {
      return res.status(400).json({ message: 'Company name is required.' });
    }

    const { rows } = await pool.query(
      `UPDATE users
       SET company_name = $1,
           workspace_profile_completed = TRUE,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [companyName.trim(), req.user.id]
    );

    await pool.query(
      `UPDATE workspaces
       SET company_name = $1
       WHERE user_id = $2`,
      [companyName.trim(), req.user.id]
    );

    res.json({ user: await formatUser(rows[0]) });
  } catch (err) { next(err); }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function formatUser(u) {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    companyName: u.company_name,
    workspaceProfileCompleted: Boolean(u.workspace_profile_completed),
    onboardingComplete: u.onboarding_complete,
    intentState: await getIntentState(u.id),
  };
}

export default router;
