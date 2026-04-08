import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildConfidenceSamplePayload,
  buildConfidenceRegenerationPayload,
  canRegenerateConfidenceSample,
} from './confidence-flow.js';

test('buildConfidenceSamplePayload normalizes kit cards before requesting the sample', () => {
  const payload = buildConfidenceSamplePayload({
    brandName: 'BHV Marais',
    kitCards: null,
    campaignType: 'Product launch',
    funnelStage: 'Top of funnel — awareness',
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
    funnelStage: 'Top of funnel — awareness',
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
      funnelStage: 'Top of funnel — awareness',
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
    funnelStage: 'Top of funnel — awareness',
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
      regenerateCount: 0,
      regenerating: false,
    }),
    true
  );

  assert.equal(
    canRegenerateConfidenceSample({
      selectedChips: [],
      freeText: 'Needs more urgency.',
      regenerateCount: 1,
      regenerating: false,
    }),
    false
  );
});
