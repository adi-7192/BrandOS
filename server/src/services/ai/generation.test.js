import test from 'node:test';
import assert from 'node:assert/strict';

import { buildConfidenceUserMessage } from './generation.js';

test('buildConfidenceUserMessage creates an initial confidence sample prompt', () => {
  const message = buildConfidenceUserMessage({
    brandName: 'BHV Marais',
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      vocabulary: ['craft', 'neighbourhood'],
      restrictedWords: ['cheap'],
    },
    campaignType: 'Product launch',
    funnelStage: 'Top of funnel',
    toneShift: 'Keep baseline',
    brandLanguage: 'French',
  });

  assert.match(message, /Generate a sample LinkedIn post for BHV Marais\./);
  assert.match(message, /Strictly follow the brand voice: Warm, Intimate/);
  assert.match(message, /Use vocabulary: craft, neighbourhood/);
  assert.match(message, /NEVER use these words: cheap/);
});

test('buildConfidenceUserMessage includes critique when regenerating a sample', () => {
  const message = buildConfidenceUserMessage({
    brandName: 'BHV Marais',
    kit: {
      voiceAdjectives: ['Warm'],
      vocabulary: ['craft'],
      restrictedWords: ['cheap'],
    },
    campaignType: 'Product launch',
    funnelStage: 'Top of funnel',
    toneShift: 'Slightly more editorial',
    brandLanguage: 'French',
    currentSample: 'Old draft',
    feedbackChips: ['Too long', 'CTA missing'],
    feedbackNotes: 'Needs more intimacy.',
  });

  assert.match(message, /Refine this existing LinkedIn sample for BHV Marais\./);
  assert.match(message, /Current sample:/);
  assert.match(message, /Feedback to address: Too long, CTA missing/);
  assert.match(message, /Additional notes: Needs more intimacy\./);
  assert.match(message, /Keep the same underlying campaign intent while improving the draft/);
});
