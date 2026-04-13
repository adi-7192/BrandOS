import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildConfidenceSamplePayload,
  buildConfidenceRegenerationPayload,
  buildConfidenceApprovalResult,
  canRegenerateConfidenceSample,
  canApproveConfidenceReaction,
  hasMeaningfulConfidenceEdit,
} from './confidence-flow.js';

test('buildConfidenceSamplePayload normalizes kit cards before requesting the sample', () => {
  const payload = buildConfidenceSamplePayload({
    brandName: 'BHV Marais',
    kitCards: null,
    campaignType: 'Product launch',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    brandLanguage: 'French',
  });

  assert.deepEqual(payload, {
    brandName: 'BHV Marais',
    kitCards: {
      voiceAdjectives: ['Authentic', 'Confident', 'Approachable'],
      vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
      restrictedWords: ['cheap', 'free', 'guarantee', 'best'],
      channelRules: {
        linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
        blog: '700–900 words · Subheadings required · End with a question or call to action',
      },
    },
    campaignType: 'Product launch',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    brandLanguage: 'French',
  });
});

test('buildConfidenceRegenerationPayload includes critique chips, notes, and current sample', () => {
  const payload = buildConfidenceRegenerationPayload(
    {
      brandName: 'BHV Marais',
      kitCards: { voiceAdjectives: ['Warm'] },
      campaignType: 'Product launch',
      funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
      toneShift: 'Slightly more editorial',
      brandLanguage: 'French',
    },
    {
      currentSample: 'Old draft',
      selectedChips: ['Too long', 'CTA missing'],
      freeText: 'Feels polished but not intimate enough.',
    }
  );

  assert.deepEqual(payload, {
    brandName: 'BHV Marais',
    kitCards: {
      voiceAdjectives: ['Warm'],
      vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
      restrictedWords: ['cheap', 'free', 'guarantee', 'best'],
      channelRules: {
        linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
        blog: '700–900 words · Subheadings required · End with a question or call to action',
      },
    },
    campaignType: 'Product launch',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Slightly more editorial',
    brandLanguage: 'French',
    currentSample: 'Old draft',
    feedbackChips: ['Too long', 'CTA missing'],
    feedbackNotes: 'Feels polished but not intimate enough.',
  });
});

test('canRegenerateConfidenceSample requires either critique chips or notes and only allows one retry', () => {
  assert.equal(
    canRegenerateConfidenceSample({
      selectedChips: [],
      freeText: '   ',
      regenerateCount: 0,
      regenerating: false,
    }),
    false
  );

  assert.equal(
    canRegenerateConfidenceSample({
      selectedChips: ['Wrong vocabulary'],
      freeText: '',
      regenerateCount: 3,
      regenerating: false,
    }),
    true
  );

  assert.equal(
    canRegenerateConfidenceSample({
      selectedChips: [],
      freeText: 'Needs more urgency.',
      regenerateCount: 0,
      regenerating: true,
    }),
    false
  );
});

test('hasMeaningfulConfidenceEdit only returns true when the editable draft changes meaningfully', () => {
  assert.equal(hasMeaningfulConfidenceEdit('Original sample', 'Original sample'), false);
  assert.equal(hasMeaningfulConfidenceEdit('Original sample', '  Original sample  '), false);
  assert.equal(hasMeaningfulConfidenceEdit('Original sample', 'Edited sample'), true);
});

test('canApproveConfidenceReaction allows almost-there after regeneration or meaningful edits', () => {
  assert.equal(
    canApproveConfidenceReaction({
      reaction: 'positive',
      regenerateCount: 0,
      originalSample: 'Original sample',
      currentSample: 'Original sample',
    }),
    true
  );

  assert.equal(
    canApproveConfidenceReaction({
      reaction: 'mixed',
      regenerateCount: 0,
      originalSample: 'Original sample',
      currentSample: 'Original sample',
    }),
    false
  );

  assert.equal(
    canApproveConfidenceReaction({
      reaction: 'mixed',
      regenerateCount: 1,
      originalSample: 'Original sample',
      currentSample: 'Original sample',
    }),
    true
  );

  assert.equal(
    canApproveConfidenceReaction({
      reaction: 'mixed',
      regenerateCount: 0,
      originalSample: 'Original sample',
      currentSample: 'Edited sample',
    }),
    true
  );
});

test('buildConfidenceApprovalResult records the completed confidence test before kit-live navigation', () => {
  assert.deepEqual(
    buildConfidenceApprovalResult({
      reaction: 'positive',
      regenerateCount: 0,
      originalSample: 'Original sample',
      currentSample: 'Original sample',
      approvedAt: '2026-04-13T10:15:00.000Z',
    }),
    {
      reaction: 'positive',
      regenerateCount: 0,
      edited: false,
      approvedAt: '2026-04-13T10:15:00.000Z',
    }
  );

  assert.deepEqual(
    buildConfidenceApprovalResult({
      reaction: 'mixed',
      regenerateCount: 1,
      originalSample: 'Original sample',
      currentSample: 'Edited sample',
      approvedAt: '2026-04-13T10:16:00.000Z',
    }),
    {
      reaction: 'mixed',
      regenerateCount: 1,
      edited: true,
      approvedAt: '2026-04-13T10:16:00.000Z',
    }
  );
});
