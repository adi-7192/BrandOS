import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildWorkspaceIntakeEmail,
  buildWorkspaceIntakeLocalPart,
  extractWorkspaceIdFromRecipient,
} from './intakeAddress.js';

test('buildWorkspaceIntakeEmail creates a workspace-specific intake address', () => {
  assert.equal(
    buildWorkspaceIntakeEmail('workspace-123', 'eemeacalau.resend.app'),
    'updates+workspace-123@eemeacalau.resend.app'
  );
  assert.equal(buildWorkspaceIntakeLocalPart('workspace-123'), 'updates+workspace-123');
});

test('extractWorkspaceIdFromRecipient reads the workspace id from the intake alias', () => {
  assert.equal(
    extractWorkspaceIdFromRecipient('updates+workspace-123@eemeacalau.resend.app'),
    'workspace-123'
  );
  assert.equal(extractWorkspaceIdFromRecipient('random@eemeacalau.resend.app'), '');
});
