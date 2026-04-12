import crypto from 'crypto';

export const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
export const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
export const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

function toBase64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function fromBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function getStateSecret(secret = process.env.JWT_SECRET) {
  const value = String(secret || '').trim();
  if (!value) {
    throw new Error('LinkedIn state secret is required.');
  }
  return value;
}

export function buildLinkedInAuthUrl({ clientId, redirectUri, scope, state }) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
  });

  return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
}

export function signLinkedInState(payload, options = {}) {
  const json = JSON.stringify(payload || {});
  const encoded = toBase64Url(json);
  const signature = crypto
    .createHmac('sha256', getStateSecret(options.secret))
    .update(encoded)
    .digest('base64url');

  return `${encoded}.${signature}`;
}

const LINKEDIN_STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

export function readLinkedInState(token, options = {}) {
  const [encoded, actualSignature] = String(token || '').split('.');
  if (!encoded || !actualSignature) {
    throw new Error('LinkedIn state is invalid.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', getStateSecret(options.secret))
    .update(encoded)
    .digest('base64url');

  // Constant-time comparison prevents HMAC oracle / timing attacks.
  const actualBuf = Buffer.from(actualSignature, 'base64url');
  const expectedBuf = Buffer.from(expectedSignature, 'base64url');
  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    throw new Error('LinkedIn state signature is invalid.');
  }

  const parsed = JSON.parse(fromBase64Url(encoded));

  // Reject replayed states older than 10 minutes.
  const issuedAt = parsed.issuedAt ? Date.parse(parsed.issuedAt) : NaN;
  if (isNaN(issuedAt) || Date.now() - issuedAt > LINKEDIN_STATE_MAX_AGE_MS) {
    throw new Error('LinkedIn state has expired.');
  }

  return parsed;
}

export function buildPersonUrn(memberId) {
  return `urn:li:person:${memberId}`;
}

export async function exchangeLinkedInCode({
  code,
  clientId,
  clientSecret,
  redirectUri,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(LINKEDIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data?.access_token) {
    const err = new Error(data?.error_description || data?.error || 'LinkedIn token exchange failed.');
    err.status = 502;
    throw err;
  }

  return data;
}

export async function fetchLinkedInUserInfo({ accessToken, fetchImpl = fetch }) {
  const response = await fetchImpl(LINKEDIN_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data?.sub) {
    const err = new Error(data?.message || 'LinkedIn user profile fetch failed.');
    err.status = 502;
    throw err;
  }

  return data;
}
