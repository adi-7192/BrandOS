import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLinkedInPublishState,
  buildLinkedInViewModel,
} from './linkedin-view.js';

test('buildLinkedInViewModel derives reconnect copy and CTA from connection status', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: false,
      status: 'reconnect_required',
      displayName: 'Ada Lovelace',
      expiresAt: '2026-04-10T10:00:00.000Z',
    }),
    {
      label: 'Reconnect required',
      tone: 'warning',
      ctaLabel: 'Reconnect LinkedIn',
      helper: 'Reconnect your personal LinkedIn account to keep publishing from BrandOS.',
      connectedAs: 'Ada Lovelace',
      expiresMeta: 'Token expired',
    }
  );
});

test('buildLinkedInPublishState disables publishing when LinkedIn is not connected', () => {
  assert.deepEqual(
    buildLinkedInPublishState({
      activeTab: 'linkedin',
      content: '',
      linkedin: { connected: false, status: 'not_connected' },
      publishing: false,
    }),
    {
      visible: true,
      disabled: true,
      label: 'Publish to LinkedIn',
      helper: 'Connect LinkedIn in Settings before publishing.',
    }
  );
});

test('buildLinkedInPublishState enables publishing for connected linkedin drafts', () => {
  assert.deepEqual(
    buildLinkedInPublishState({
      activeTab: 'linkedin',
      content: 'Ready to publish',
      linkedin: { connected: true, status: 'connected' },
      publishing: false,
    }),
    {
      visible: true,
      disabled: false,
      label: 'Publish to LinkedIn',
      helper: 'This publishes immediately to your connected personal LinkedIn account.',
    }
  );
});
