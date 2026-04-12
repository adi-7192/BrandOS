import { safeDecryptEmail } from './crypto.js';

export const LINKEDIN_UGC_POSTS_URL = 'https://api.linkedin.com/v2/ugcPosts';

export function buildLinkedInTextPostRequest({ authorUrn, content }) {
  return {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: content },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

export function mapLinkedInConnectionStatus(connection, options = {}) {
  if (!connection) {
    return {
      connected: false,
      status: 'not_connected',
      displayName: '',
      email: '',
      expiresAt: null,
      lastValidatedAt: null,
      canPublish: false,
    };
  }

  const now = options.now ? new Date(options.now) : new Date();
  const expiresAt = connection.expires_at || null;
  const isExpired = expiresAt ? new Date(expiresAt).getTime() <= now.getTime() : false;
  const status = connection.connection_status === 'error'
    ? 'connection_error'
    : connection.connection_status === 'expired' || isExpired
      ? 'reconnect_required'
      : 'connected';

  return {
    connected: status === 'connected',
    status,
    displayName: connection.linkedin_display_name || '',
    email: safeDecryptEmail(connection.linkedin_email),
    expiresAt,
    lastValidatedAt: connection.last_validated_at || null,
    canPublish: status === 'connected',
  };
}

export function normalizeLinkedInPublishError(error) {
  return {
    status: error?.status || 502,
    code: error?.code || 'linkedin_publish_failed',
    message: error?.message || 'LinkedIn publish failed.',
  };
}

export async function publishLinkedInTextPost({
  accessToken,
  authorUrn,
  content,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(LINKEDIN_UGC_POSTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(buildLinkedInTextPostRequest({ authorUrn, content })),
  });

  const data = await readJsonSafely(response);
  if (!response.ok) {
    throw normalizeLinkedInPublishError({
      status: response.status || 502,
      code: data?.serviceErrorCode || 'linkedin_publish_failed',
      message: data?.message || 'LinkedIn publish failed.',
    });
  }

  return {
    postUrn: response.headers.get('x-restli-id') || data?.id || null,
    data,
  };
}

async function readJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
