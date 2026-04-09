import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildConfidenceUserMessage,
  buildGenerationUserMessage,
  buildPreviewSuggestionUserMessage,
  buildSelectionRewriteUserMessage,
} from './generation.js';

test('buildConfidenceUserMessage creates an initial confidence sample prompt', () => {
  const message = buildConfidenceUserMessage({
    brandName: 'BHV Marais',
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      vocabulary: ['craft', 'neighbourhood'],
      restrictedWords: ['cheap'],
    },
    campaignType: 'Product launch',
    funnelStages: ['Top of funnel', 'Mid funnel'],
    toneShift: 'Keep baseline',
    brandLanguage: 'French',
  });

  assert.match(message, /Generate a sample LinkedIn post for BHV Marais\./);
  assert.match(message, /Strictly follow the brand voice: Warm, Intimate/);
  assert.match(message, /Use vocabulary: craft, neighbourhood/);
  assert.match(message, /NEVER use these words: cheap/);
  assert.match(message, /Funnel stages: Top of funnel, Mid funnel/);
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
    funnelStages: ['Top of funnel', 'Mid funnel'],
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
  assert.match(message, /Funnel stages: Top of funnel, Mid funnel/);
});

test('buildGenerationUserMessage includes brand memory fields beyond voice and restricted words', () => {
  const message = buildGenerationUserMessage({
    brief: {
      brandName: 'BHV Marais',
      campaignName: 'Summer workshop series',
      campaignType: 'Product launch',
      audience: 'Design-aware Parisians',
      toneShift: 'More editorial',
      funnelStages: ['Top of funnel', 'Mid funnel'],
      funnelStage: 'Top of funnel · Mid funnel',
      contentGoal: 'Brand visibility',
      keyMessage: 'Craft-led summer series',
      language: 'French',
      proofStyle: 'Data-led',
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
  assert.match(message, /Funnel stages: Top of funnel, Mid funnel/);
  assert.match(message, /Voice formality \(1 informal - 5 formal\): 3/);
  assert.match(message, /Campaign core why: Position the series as a local cultural moment\./);
  assert.match(message, /Brand-specific LinkedIn rule: Hook in line 1 · Keep it punchy/);
  assert.match(message, /Brand-specific blog rule: Use subheadings and examples/);
  assert.match(message, /Guideline excerpt: Use neighbourhood-first language\. Avoid promotional hype\./);
});

test('buildPreviewSuggestionUserMessage asks the model to prefill editable preview sections from the brief', () => {
  const message = buildPreviewSuggestionUserMessage({
    brief: {
      brandName: 'Moodway',
      campaignName: 'Virtual Try-On Launch',
      campaignType: 'Product launch',
      audienceType: 'E-commerce teams',
      contentGoal: 'Drive demo interest',
      keyMessage: 'Shoppers can try styles before they buy.',
      language: 'English',
      kit: {
        voiceAdjectives: ['Clear', 'Confident'],
        vocabulary: ['virtual try-on', 'conversion lift'],
        restrictedWords: ['guaranteed'],
        channelRules: {
          linkedin: 'Lead with the shopper problem',
          blog: 'Use a clear promise in the headline',
        },
      },
    },
    format: 'linkedin',
  });

  assert.match(message, /Draft preview sections for a LinkedIn post for Moodway\./);
  assert.match(message, /Campaign: Virtual Try-On Launch/);
  assert.match(message, /Audience: E-commerce teams/);
  assert.match(message, /Key message: Shoppers can try styles before they buy\./);
  assert.match(message, /Proof style: Brand default/);
  assert.match(message, /Return ONLY a JSON object/);
  assert.match(message, /"hook": "opening line suggestion"/);
});

test('buildSelectionRewriteUserMessage targets only the selected passage for one format', () => {
  const message = buildSelectionRewriteUserMessage({
    brief: {
      brandName: 'Moodway',
      language: 'English',
      kit: {
        voiceAdjectives: ['Clear', 'Confident'],
        vocabulary: ['virtual try-on'],
        restrictedWords: ['guaranteed'],
      },
    },
    format: 'linkedin',
    selectedText: 'This line needs work.',
    currentText: 'Intro.\nThis line needs work.\nClosing.',
    instruction: 'Make it sharper and shorter.',
  });

  assert.match(message, /Rewrite only the selected Linkedin passage for Moodway\./);
  assert.match(message, /Selected passage:\nThis line needs work\./);
  assert.match(message, /Instruction: Make it sharper and shorter\./);
  assert.match(message, /Return ONLY a JSON object/);
  assert.match(message, /"selection": "rewritten passage only"/);
});
