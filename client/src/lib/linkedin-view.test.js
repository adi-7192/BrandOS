import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildLinkedInFeedbackState,
  buildLinkedInPublishState,
  buildLinkedInViewModel,
} from './linkedin-view.js';

test('buildLinkedInViewModel derives reconnect copy and CTA from connection status', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: false,
      status: 'reconnect_required',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
    }),
    {
      title: 'Reconnect LinkedIn',
      tone: 'warning',
      badgeLabel: 'Reconnect required',
      primaryActionLabel: 'Reconnect LinkedIn',
    secondaryActionLabel: 'Disconnect',
    reconnectActionLabel: '',
    summary: 'Your LinkedIn connection needs attention before BrandOS can publish to your personal LinkedIn account again.',
      connectedAs: 'Ada Lovelace',
      accountEmail: 'ada@example.com',
      readinessLabel: 'Publishing blocked',
      lastCheckedLabel: '',
      lastCheckedValue: '',
      bullets: [],
    }
  );
});

test('buildLinkedInViewModel returns stable connected-state actions and account metadata', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: true,
      status: 'connected',
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      lastValidatedAt: '2026-04-10T08:45:00.000Z',
    }),
    {
      title: 'LinkedIn connected',
      tone: 'success',
      badgeLabel: 'Connected',
      primaryActionLabel: 'Connected',
    secondaryActionLabel: 'Disconnect',
    reconnectActionLabel: 'Reconnect',
    summary: 'BrandOS can publish approved posts to your personal LinkedIn account. Company-page posting comes later.',
      connectedAs: 'Ada Lovelace',
      accountEmail: 'ada@example.com',
      readinessLabel: 'Ready to publish',
      lastCheckedLabel: 'Last checked',
      lastCheckedValue: '2026-04-10T08:45:00.000Z',
      bullets: [],
    }
  );
});

test('buildLinkedInViewModel returns onboarding-style guidance when disconnected', () => {
  assert.deepEqual(
    buildLinkedInViewModel({
      connected: false,
      status: 'not_connected',
    }),
    {
      title: 'Connect LinkedIn',
      tone: 'neutral',
      badgeLabel: 'Not connected',
      primaryActionLabel: 'Connect LinkedIn',
    secondaryActionLabel: '',
    reconnectActionLabel: '',
    summary: 'Connect your personal LinkedIn account once to publish approved drafts directly from BrandOS. Company-page posting comes later.',
      connectedAs: '',
      accountEmail: '',
      readinessLabel: 'Publishing unavailable',
      lastCheckedLabel: '',
      lastCheckedValue: '',
      bullets: [
        'Connect once from Settings',
        'Approve BrandOS in LinkedIn',
        'Publish approved LinkedIn drafts directly from BrandOS',
      ],
    }
  );
});

test('buildLinkedInViewModel exposes onboarding bullets for disconnected state', () => {
  const model = buildLinkedInViewModel({ connected: false, status: 'not_connected' });

  assert.deepEqual(model.bullets, [
    'Connect once from Settings',
    'Approve BrandOS in LinkedIn',
    'Publish approved LinkedIn drafts directly from BrandOS',
  ]);
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
      mode: 'setup',
      disabled: true,
      badgeLabel: 'Setup required',
      title: 'Publish to LinkedIn',
      label: 'Publish to LinkedIn',
    helper: 'You can publish this post directly from BrandOS. Connect LinkedIn once in Settings and BrandOS can post to your personal account on your behalf.',
      primaryActionLabel: 'Connect LinkedIn in Settings',
      secondaryActionLabel: 'Copy draft for now',
      steps: [
        'Open Settings',
        'Connect your personal LinkedIn',
        'Come back here and publish directly',
      ],
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
      mode: 'ready',
      disabled: false,
      badgeLabel: 'Ready to publish',
      title: 'Publish to LinkedIn',
      label: 'Publish to LinkedIn',
      helper: 'BrandOS is ready to publish this LinkedIn post directly to your connected account.',
      primaryActionLabel: 'Publish to LinkedIn',
      secondaryActionLabel: 'Copy draft for now',
      steps: [],
    }
  );
});

test('buildLinkedInFeedbackState exposes success and warning banner tones', () => {
  assert.equal(buildLinkedInFeedbackState('connected').tone, 'success');
  assert.equal(buildLinkedInFeedbackState('error').tone, 'warning');
});
