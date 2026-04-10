import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLinkedInAuthUrl,
  buildPersonUrn,
  exchangeLinkedInCode,
  fetchLinkedInUserInfo,
  readLinkedInState,
  signLinkedInState,
} from './oauth.js';

const STATE_SECRET = 'state-secret';

test('buildLinkedInAuthUrl includes client id, scope, redirect uri, and state', () => {
  const url = buildLinkedInAuthUrl({
    clientId: 'client-id',
    redirectUri: 'https://api.brandos.test/api/linkedin/callback',
    scope: 'openid profile email w_member_social',
    state: 'signed-state',
  });

  assert.match(url, /client-id/);
  assert.match(url, /w_member_social/);
  assert.match(url, /signed-state/);
  assert.match(url, /api\.brandos\.test/);
});

test('signLinkedInState and readLinkedInState round-trip payloads', () => {
  const token = signLinkedInState({
    userId: 'user-1',
    returnTo: '/settings',
    nonce: 'nonce-1',
    issuedAt: '2026-04-10T12:00:00.000Z',
  }, { secret: STATE_SECRET });

  assert.deepEqual(
    readLinkedInState(token, { secret: STATE_SECRET }),
    {
      userId: 'user-1',
      returnTo: '/settings',
      nonce: 'nonce-1',
      issuedAt: '2026-04-10T12:00:00.000Z',
    }
  );
});

test('buildPersonUrn prefixes a member id correctly', () => {
  assert.equal(buildPersonUrn('abc123'), 'urn:li:person:abc123');
});

test('exchangeLinkedInCode posts the expected authorization-code payload', async () => {
  const calls = [];
  const response = await exchangeLinkedInCode({
    code: 'code-123',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    redirectUri: 'https://api.brandos.test/api/linkedin/callback',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        async json() {
          return { access_token: 'token-123', expires_in: 3600 };
        },
      };
    },
  });

  assert.equal(response.access_token, 'token-123');
  assert.equal(calls[0].url, 'https://www.linkedin.com/oauth/v2/accessToken');
  assert.match(String(calls[0].options.body), /authorization_code/);
  assert.match(String(calls[0].options.body), /code-123/);
});

test('fetchLinkedInUserInfo reads the linkedin user profile via bearer token', async () => {
  const calls = [];
  const profile = await fetchLinkedInUserInfo({
    accessToken: 'token-123',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        async json() {
          return { sub: 'abc123', name: 'Ada Lovelace', email: 'ada@example.com' };
        },
      };
    },
  });

  assert.deepEqual(profile, { sub: 'abc123', name: 'Ada Lovelace', email: 'ada@example.com' });
  assert.equal(calls[0].url, 'https://api.linkedin.com/v2/userinfo');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-123');
});
