import test from 'node:test';
import assert from 'node:assert/strict';

import { buildConfidenceUserMessage, buildGenerationUserMessage } from './generation.js';

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

test('buildGenerationUserMessage includes brand memory fields beyond voice and restricted words', () => {
  const message = buildGenerationUserMessage({
    brief: {
      brandName: 'BHV Marais',
      campaignName: 'Summer workshop series',
      campaignType: 'Product launch',
      audience: 'Design-aware Parisians',
      toneShift: 'More editorial',
      funnelStage: 'Top of funnel',
      contentGoal: 'Brand visibility',
      keyMessage: 'Craft-led summer series',
      language: 'French',
      proofStyle: 'Data-led',
      contentRole: 'Standalone / organic reach',
      voiceFormality: 3,
      campaignCoreWhy: 'Position the series as a local cultural moment.',
      publishingFrequency: 'Weekly',
      kit: {
        voiceAdjectives: ['Warm', 'Intimate'],
        vocabulary: ['craft', 'neighbourhood'],
        restrictedWords: ['cheap'],
        guidelineTextExcerpt: 'Use neighbourhood-first language. Avoid promotional hype.',
        channelRules: {
          linkedin: 'Hook in line 1 · Keep it punchy',
          blog: 'Use subheadings and examples',
        },
      },
    },
    sections: {
      linkedin: { hook: 'A workshop series rooted in the Marais.' },
      blog: { headline: 'Summer workshops in the Marais' },
    },
  });

  assert.match(message, /Proof style: Data-led/);
  assert.match(message, /Content role: Standalone \/ organic reach/);
  assert.match(message, /Voice formality \(1 informal - 5 formal\): 3/);
  assert.match(message, /Campaign core why: Position the series as a local cultural moment\./);
  assert.match(message, /Brand-specific LinkedIn rule: Hook in line 1 · Keep it punchy/);
  assert.match(message, /Brand-specific blog rule: Use subheadings and examples/);
  assert.match(message, /Guideline excerpt: Use neighbourhood-first language\. Avoid promotional hype\./);
});
