import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSettingsViewModel } from './settings-view.js';

test('buildSettingsViewModel derives section statuses from the settings payload', () => {
  const model = buildSettingsViewModel({
    workspace: {
      brandCount: 3,
      onboardingComplete: true,
      gmailConnectionStatus: 'connected',
    },
    inbox: {
      gmailAvailable: true,
      intakeEmail: 'intake+abcd@brandos.ai',
    },
    ai: {
      configured: true,
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    },
    security: {
      googleConnected: true,
      passwordEnabled: false,
      ssoEnabled: false,
    },
    linkedin: {
      connected: true,
      status: 'connected',
      displayName: 'Ada Lovelace',
      expiresAt: '2026-06-01T00:00:00.000Z',
    },
  });

  assert.deepEqual(model.workspaceStatus, {
    label: 'Ready',
    tone: 'success',
    meta: '3 brands live',
  });
  assert.deepEqual(model.inboxStatus, {
    label: 'Connected',
    tone: 'success',
    meta: 'Forwarding address active',
  });
  assert.deepEqual(model.aiStatus, {
    label: 'Active',
    tone: 'success',
    meta: 'anthropic · claude-sonnet-4-6',
  });
  assert.deepEqual(model.linkedinStatus, {
    label: 'Connected',
    tone: 'success',
    meta: 'Ada Lovelace',
  });
  assert.deepEqual(model.securityMethods, ['Google']);
});

test('buildSettingsViewModel falls back to setup states when systems are not ready', () => {
  const model = buildSettingsViewModel({
    workspace: {
      brandCount: 0,
      onboardingComplete: false,
      gmailConnectionStatus: 'not_connected',
    },
    inbox: {
      gmailAvailable: false,
      intakeEmail: null,
    },
    ai: {
      configured: false,
      provider: 'openai',
      model: 'gpt-4o',
    },
    security: {
      googleConnected: false,
      passwordEnabled: true,
      ssoEnabled: false,
    },
    linkedin: {
      connected: false,
      status: 'not_connected',
    },
  });

  assert.deepEqual(model.workspaceStatus, {
    label: 'In setup',
    tone: 'warning',
    meta: 'Add your first brand',
  });
  assert.deepEqual(model.inboxStatus, {
    label: 'Unavailable',
    tone: 'neutral',
    meta: 'Intake email not configured',
  });
  assert.deepEqual(model.aiStatus, {
    label: 'Needs attention',
    tone: 'warning',
    meta: 'openai · gpt-4o',
  });
  assert.deepEqual(model.linkedinStatus, {
    label: 'Not connected',
    tone: 'neutral',
    meta: 'Personal publishing unavailable',
  });
  assert.deepEqual(model.securityMethods, ['Password']);
});
