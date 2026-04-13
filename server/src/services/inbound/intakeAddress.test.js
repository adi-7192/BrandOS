import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildWorkspaceIntakeEmail,
  buildWorkspaceIntakeLocalPart,
  extractWorkspaceIdFromRecipient,
} from './intakeAddress.js';

test('buildWorkspaceIntakeEmail creates a workspace-specific intake address', () => {
  const workspaceId = '11111111-1111-4111-8111-111111111111';

  assert.equal(
    buildWorkspaceIntakeEmail(workspaceId, 'eemeacalau.resend.app'),
    'updates+11111111-1111-4111-8111-111111111111@eemeacalau.resend.app'
  );
  assert.equal(buildWorkspaceIntakeLocalPart(workspaceId), 'updates+11111111-1111-4111-8111-111111111111');
});

test('extractWorkspaceIdFromRecipient reads the workspace id from the intake alias', () => {
  assert.equal(
    extractWorkspaceIdFromRecipient('updates+11111111-1111-4111-8111-111111111111@eemeacalau.resend.app'),
    '11111111-1111-4111-8111-111111111111'
  );
  assert.equal(extractWorkspaceIdFromRecipient('updates+workspace-123@eemeacalau.resend.app'), '');
  assert.equal(extractWorkspaceIdFromRecipient('random@eemeacalau.resend.app'), '');
});
