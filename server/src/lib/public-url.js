function pickHeaderValue(value) {
  if (!value) return '';
  return String(value).split(',')[0].trim();
}

// Origins that are safe for OAuth redirect URIs.
// An attacker can spoof the Host / x-forwarded-host headers on a direct
// request; without this guard, they could cause the server to issue an
// authorization URL whose redirect_uri points at their domain.
// FRONTEND_URL always takes precedence and bypasses this check.
const SAFE_ORIGIN_PATTERNS = [
  /^http:\/\/localhost(:\d+)?$/,
  /^https:\/\/[a-z0-9][a-z0-9-]*\.vercel\.app$/,
];

function isSafeOrigin(origin) {
  return SAFE_ORIGIN_PATTERNS.some((p) => p.test(origin));
}

export function getRequestOrigin(req) {
  const forwardedProto = pickHeaderValue(req.headers['x-forwarded-proto']);
  const forwardedHost = pickHeaderValue(req.headers['x-forwarded-host']);
  const host = forwardedHost || pickHeaderValue(req.headers.host);
  const proto = forwardedProto || 'http';

  if (!host) return 'http://localhost:3000';

  const origin = `${proto}://${host}`;
  if (!isSafeOrigin(origin)) {
    // Reject unrecognised origins. Set FRONTEND_URL (and GOOGLE_REDIRECT_URI /
    // LINKEDIN_REDIRECT_URI) in env to configure a custom production domain.
    console.warn('[public-url] Rejected unrecognised request origin; falling back to localhost. Set FRONTEND_URL to configure a custom domain.');
    return 'http://localhost:3000';
  }

  return origin;
}

export function getFrontendUrl(req, env = process.env) {
  return env.FRONTEND_URL || getRequestOrigin(req);
}

export function getGoogleRedirectUri(req, env = process.env) {
  return env.GOOGLE_REDIRECT_URI || `${getRequestOrigin(req)}/api/auth/google/callback`;
}

export function getLinkedInRedirectUri(req, env = process.env) {
  return env.LINKEDIN_REDIRECT_URI || `${getRequestOrigin(req)}/api/linkedin/callback`;
}
