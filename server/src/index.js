import 'dotenv/config';

// Fail fast if JWT_SECRET is missing or too short — a weak secret lets anyone
// forge tokens. Minimum 32 characters gives 256 bits of entropy for HS256.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters long.');
  process.exit(1);
}

// Fail fast if LinkedIn token encryption key is missing or weak.
// The key is the sole protection for access/refresh tokens stored in the DB.
if (!process.env.LINKEDIN_TOKEN_ENCRYPTION_KEY || process.env.LINKEDIN_TOKEN_ENCRYPTION_KEY.length < 32) {
  console.error('FATAL: LINKEDIN_TOKEN_ENCRYPTION_KEY must be set and at least 32 characters long.');
  process.exit(1);
}

// In production, ALLOWED_ORIGINS must be set explicitly — the localhost default
// would silently block all real-browser traffic.
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.error('FATAL: ALLOWED_ORIGINS must be set in production to configure the CORS allowlist.');
  process.exit(1);
}

// In production, FRONTEND_URL must be set so OAuth redirect URIs are derived
// correctly rather than guessed from the request origin.
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  console.error('FATAL: FRONTEND_URL must be set in production for OAuth redirect URI derivation.');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import brandsRouter from './routes/brands.js';
import inboxRouter from './routes/inbox.js';
import generateRouter from './routes/generate.js';
import campaignsRouter from './routes/campaigns.js';
import dashboardRouter from './routes/dashboard.js';
import intentRouter from './routes/intent.js';
import settingsRouter from './routes/settings.js';
import inboundRouter from './routes/inbound.js';
import linkedinRouter from './routes/linkedin.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Security headers — CSP locks down asset sources; HSTS enforces HTTPS for 2 years
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS — explicit allowlist; no wildcards.
// In production set ALLOWED_ORIGINS=https://yourdomain.com (comma-separated).
const rawAllowedOrigins = process.env.ALLOWED_ORIGINS;
const allowedOrigins = rawAllowedOrigins
  ? rawAllowedOrigins.split(',').map(o => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = browser navigation (OAuth redirects, direct links) or
    // server-to-server call. Neither is subject to CORS enforcement — browsers
    // don't set Origin on top-level navigations and server clients are not
    // bound by CORS. Allow unconditionally; JWT auth handles actual security.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiters
const rateLimitResponse = { message: 'Too many requests, please try again later.' };

const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,          // 30 AI calls per 15 min per IP — covers normal working sessions
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

const inboundLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

app.use('/api/auth/signin', signinLimiter);
// Rate-limit only the AI-heavy endpoints, not session management (GET/PATCH sessions)
app.use('/api/generate/create', generateLimiter);
app.use('/api/generate/preview', generateLimiter);
app.use('/api/generate/iterate', generateLimiter);
app.use('/api/generate/rewrite-selection', generateLimiter);
app.use('/api/inbound/email', inboundLimiter);

app.use('/api/inbound', express.raw({ type: 'application/json' }), inboundRouter);
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/generate', generateRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/intent', intentRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/linkedin', linkedinRouter);

app.use(errorHandler);

// Only listen when running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`BrandOS server running on port ${PORT}`);
  });
}

export default app;
