import test from 'node:test';
import assert from 'node:assert/strict';

import { buildKitExtractionUserMessage } from './kitExtraction.js';

test('buildKitExtractionUserMessage includes uploaded guideline text when available', () => {
  const message = buildKitExtractionUserMessage({
    brandName: 'BHV Marais',
    primaryMarket: 'France',
    brandLanguage: 'French',
    audienceType: 'Urban creatives',
    guidelineTextExcerpt: 'Use neighbourhood-first language. Avoid promotional hype.',
    websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
    pastContentExamples: 'Join us for a thoughtful summer moment.',
  });

  assert.match(message, /Uploaded brand guideline excerpt:/);
  assert.match(message, /Use neighbourhood-first language\. Avoid promotional hype\./);
  assert.match(message, /Website evidence summary:/);
  assert.match(message, /Past content examples:/);
});
