import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getFrontendUrl,
  getGoogleRedirectUri,
  getRequestOrigin,
} from './public-url.js';

test('getRequestOrigin prefers forwarded proto and host headers', () => {
  const req = {
    headers: {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'brand-os-client.vercel.app',
      host: 'localhost:4000',
    },
  };

  assert.equal(getRequestOrigin(req), 'https://brand-os-client.vercel.app');
});

test('getRequestOrigin falls back to host header and http', () => {
  const req = {
    headers: {
      host: 'localhost:4000',
    },
  };

  assert.equal(getRequestOrigin(req), 'http://localhost:4000');
});

test('frontend and google urls prefer explicit environment variables', () => {
  const req = {
    headers: {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'brand-os-client.vercel.app',
    },
  };

  const env = {
    FRONTEND_URL: 'https://app.example.com',
    GOOGLE_REDIRECT_URI: 'https://api.example.com/api/auth/google/callback',
  };

  assert.equal(getFrontendUrl(req, env), 'https://app.example.com');
  assert.equal(
    getGoogleRedirectUri(req, env),
    'https://api.example.com/api/auth/google/callback'
  );
});

test('frontend and google urls fall back to request origin when env vars are absent', () => {
  const req = {
    headers: {
      'x-forwarded-proto': 'https',
      host: 'brand-os-client.vercel.app',
    },
  };

  assert.equal(getFrontendUrl(req, {}), 'https://brand-os-client.vercel.app');
  assert.equal(
    getGoogleRedirectUri(req, {}),
    'https://brand-os-client.vercel.app/api/auth/google/callback'
  );
});
