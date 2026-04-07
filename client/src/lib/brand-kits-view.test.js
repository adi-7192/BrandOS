import test from 'node:test';
import assert from 'node:assert/strict';

import { buildBrandCardModel, buildBrandDetailSections } from './brand-kits-view.js';

test('buildBrandCardModel creates a reference-style card summary from brand kit data', () => {
  const model = buildBrandCardModel({
    id: 'brand-1',
    name: 'BHV Marais',
    market: 'France',
    language: 'French',
    kitVersion: 2,
    kit: {
      voiceAdjectives: ['Intimate', 'Design-aware', 'Neighbourhood-first'],
      vocabulary: ['Craft-led', 'Local makers'],
      restrictedWords: ['Cheap'],
      contentGoal: 'Product launch storytelling',
      audienceType: '28-40 urban creatives',
      channelRulesLinkedin: 'Keep the opening concise.',
      channelRulesBlog: 'Lead with the local context.',
    },
  });

  assert.equal(model.title, 'BHV Marais');
  assert.equal(model.descriptor, 'France · French');
  assert.equal(model.toneSummary, 'Intimate, Design-aware');
  assert.equal(model.audienceSummary, '28-40 urban creatives');
  assert.equal(model.status.label, 'active');
  assert.equal(model.status.meta, 'Kit v2');
  assert.deepEqual(model.signals, ['Product launch storytelling', 'Craft-led', 'Avoid: Cheap']);
  assert.equal(model.swatches.length, 4);
});

test('buildBrandDetailSections groups brand data into summary metrics and display sections', () => {
  const sections = buildBrandDetailSections({
    id: 'brand-1',
    name: 'BHV Marais',
    market: 'France',
    language: 'French',
    kitVersion: 2,
    kit: {
      voiceAdjectives: ['Intimate', 'Design-aware'],
      vocabulary: ['Craft-led', 'Local makers'],
      restrictedWords: ['Cheap'],
      contentGoal: 'Product launch storytelling',
      publishingFrequency: 'Weekly',
      audienceType: '28-40 urban creatives',
      channelRulesLinkedin: 'Keep the opening concise.',
      channelRulesBlog: 'Lead with the local context.',
    },
  });

  assert.deepEqual(sections.summary, [
    { label: 'Market', value: 'France' },
    { label: 'Language', value: 'French' },
    { label: 'Audience', value: '28-40 urban creatives' },
    { label: 'Kit Version', value: 'v2' },
  ]);

  assert.deepEqual(sections.cards[0], {
    title: 'Brand voice',
    tone: 'accent',
    items: ['Intimate', 'Design-aware'],
    empty: 'Voice guidance has not been defined yet.',
  });

  assert.deepEqual(sections.cards[3], {
    title: 'Channel rules',
    tone: 'neutral',
    items: ['LinkedIn: Keep the opening concise.', 'Blog: Lead with the local context.'],
    empty: 'Channel rules have not been added yet.',
  });
});
