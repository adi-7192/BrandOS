import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLinkedInTextPostRequest,
  mapLinkedInConnectionStatus,
  normalizeLinkedInPublishError,
  publishLinkedInTextPost,
} from './publish.js';

test('buildLinkedInTextPostRequest builds a text-only ugc payload', () => {
  assert.deepEqual(
    buildLinkedInTextPostRequest({
      authorUrn: 'urn:li:person:abc123',
      content: 'Hello LinkedIn',
    }),
    {
      author: 'urn:li:person:abc123',
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: 'Hello LinkedIn' },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }
  );
});

test('mapLinkedInConnectionStatus marks expired connected records as reconnect required', () => {
  assert.deepEqual(
    mapLinkedInConnectionStatus({
      linkedin_display_name: 'Ada Lovelace',
      linkedin_email: 'ada@example.com',
      expires_at: '2020-01-01T00:00:00.000Z',
      last_validated_at: '2026-04-09T00:00:00.000Z',
      connection_status: 'connected',
    }, { now: '2026-04-10T00:00:00.000Z' }),
    {
      connected: false,
      status: 'reconnect_required',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      expiresAt: '2020-01-01T00:00:00.000Z',
      lastValidatedAt: '2026-04-09T00:00:00.000Z',
      canPublish: false,
    }
  );
});

test('mapLinkedInConnectionStatus treats expired connection status as reconnect required', () => {
  assert.deepEqual(
    mapLinkedInConnectionStatus({
      linkedin_display_name: 'Ada Lovelace',
      connection_status: 'expired',
    }, { now: '2026-04-10T00:00:00.000Z' }),
    {
      connected: false,
      status: 'reconnect_required',
      displayName: 'Ada Lovelace',
      email: '',
      expiresAt: null,
      lastValidatedAt: null,
      canPublish: false,
    }
  );
});

test('normalizeLinkedInPublishError converts unknown errors into a safe app shape', () => {
  assert.deepEqual(
    normalizeLinkedInPublishError(new Error('Nope')),
    {
      status: 502,
      code: 'linkedin_publish_failed',
      message: 'Nope',
    }
  );
});

test('normalizeLinkedInPublishError preserves explicit application errors', () => {
  const error = new Error('Reconnect LinkedIn in Settings before publishing.');
  error.status = 409;

  assert.deepEqual(
    normalizeLinkedInPublishError(error),
    {
      status: 409,
      code: 'linkedin_publish_failed',
      message: 'Reconnect LinkedIn in Settings before publishing.',
    }
  );
});

test('publishLinkedInTextPost posts the ugc payload and returns the LinkedIn reference', async () => {
  const calls = [];
  const result = await publishLinkedInTextPost({
    accessToken: 'token-123',
    authorUrn: 'urn:li:person:abc123',
    content: 'Hello LinkedIn',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        headers: {
          get(name) {
            return name.toLowerCase() === 'x-restli-id' ? 'share-123' : null;
          },
        },
        async json() {
          return {};
        },
      };
    },
  });

  assert.equal(calls[0].url, 'https://api.linkedin.com/v2/ugcPosts');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token-123');
  assert.equal(result.postUrn, 'share-123');
});

test('publishLinkedInTextPost tolerates empty response bodies when a header reference exists', async () => {
  const result = await publishLinkedInTextPost({
    accessToken: 'token-123',
    authorUrn: 'urn:li:person:abc123',
    content: 'Hello LinkedIn',
    fetchImpl: async () => ({
      ok: true,
      headers: {
        get(name) {
          return name.toLowerCase() === 'x-restli-id' ? 'share-456' : null;
        },
      },
      async json() {
        throw new Error('No JSON body');
      },
    }),
  });

  assert.equal(result.postUrn, 'share-456');
});
