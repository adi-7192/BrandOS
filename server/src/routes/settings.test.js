import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSettingsResponse } from './settings.js';

test('buildSettingsResponse includes mapped linkedin connection state', () => {
  const result = buildSettingsResponse({
    user: {
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      company_name: 'Moodway',
      onboarding_complete: true,
      preferred_inbox_view: 'updates',
      include_original_email: true,
      forwarding_enabled: true,
      default_content_format: 'linkedin',
      tone_strictness: 'balanced',
      preferred_output_length: 'standard',
      google_id: 'google-1',
      password_hash: 'hash',
    },
    workspace: {
      id: 'workspace-1',
      company_name: 'Moodway',
      display_name: 'Moodway',
      gmail_connection_status: 'not_connected',
    },
    brandCount: 2,
    linkedin: {
      linkedin_display_name: 'Ada Lovelace',
      linkedin_email: 'ada@example.com',
      connection_status: 'connected',
      last_validated_at: '2026-04-10T10:00:00.000Z',
      expires_at: '2026-04-11T10:00:00.000Z',
    },
  });

  assert.deepEqual(result.linkedin, {
    connected: true,
    status: 'connected',
    displayName: 'Ada Lovelace',
    email: 'ada@example.com',
    expiresAt: '2026-04-11T10:00:00.000Z',
    lastValidatedAt: '2026-04-10T10:00:00.000Z',
    canPublish: true,
  });
});
