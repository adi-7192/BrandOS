import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBrandDeleteConfirmation,
  buildCampaignDeleteConfirmation,
} from './destructive-actions.js';

test('buildBrandDeleteConfirmation explains the full permanent cascade clearly', () => {
  const confirmation = buildBrandDeleteConfirmation({
    brandName: 'BHV Marais',
  });

  assert.deepEqual(confirmation, {
    title: 'Delete brand kit',
    subject: 'BHV Marais',
    description: 'This permanently deletes this brand kit and all related campaign work for this brand. This action cannot be undone.',
    warningItems: [
      'All campaign work for this brand will be permanently deleted.',
      'Saved drafts and inbox briefs tied to this brand will be permanently deleted.',
      'Uploaded guideline files for this brand will be permanently deleted.',
    ],
    confirmLabel: 'Delete brand kit permanently',
    confirmText: 'BHV Marais',
  });
});

test('buildCampaignDeleteConfirmation warns that the campaign session is permanently removed', () => {
  const confirmation = buildCampaignDeleteConfirmation({
    sessionTitle: 'Spring launch',
  });

  assert.deepEqual(confirmation, {
    title: 'Delete campaign',
    subject: 'Spring launch',
    description: 'This permanently deletes this campaign and its in-progress work. This action cannot be undone.',
    warningItems: [
      'The current brief, preview, and generated content for this campaign will be permanently deleted.',
    ],
    confirmLabel: 'Delete campaign permanently',
  });
});
