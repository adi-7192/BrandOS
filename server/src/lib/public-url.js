function pickHeaderValue(value) {
  if (!value) return '';
  return String(value).split(',')[0].trim();
}

export function getRequestOrigin(req) {
  const forwardedProto = pickHeaderValue(req.headers['x-forwarded-proto']);
  const forwardedHost = pickHeaderValue(req.headers['x-forwarded-host']);
  const host = forwardedHost || pickHeaderValue(req.headers.host);
  const proto = forwardedProto || 'http';

  if (!host) {
    return 'http://localhost:3000';
  }

  return `${proto}://${host}`;
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
