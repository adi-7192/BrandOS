import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildConfirmedBrief,
  buildGeneratingContext,
  buildManualBriefFromBrand,
  isManualBriefReady,
} from './generation-flow.js';

test('buildConfirmedBrief keeps canonical brief context while applying manual overrides', () => {
  const brief = buildConfirmedBrief(
    {
      brandName: 'BHV Marais',
      audienceType: '28-40 urban creatives',
      contentGoal: 'Brand visibility',
      kit: { restrictedWords: ['cheap'] },
    },
    {
      audienceType: 'Design-conscious travellers',
      contentGoal: '',
    }
  );

  assert.deepEqual(brief, {
    brandName: 'BHV Marais',
    campaignName: '',
    campaignType: '',
    keyMessage: '',
    toneShift: '',
    audience: 'Design-conscious travellers',
    audienceType: 'Design-conscious travellers',
    contentGoal: 'Brand visibility',
    kit: { restrictedWords: ['cheap'] },
  });
});

test('buildGeneratingContext exposes the real kit-backed context summary', () => {
  const context = buildGeneratingContext({
    language: 'French',
    toneShift: 'More editorial',
    audienceType: 'Design-conscious travellers',
    contentGoal: 'Brand visibility',
    keyMessage: 'Craft-led summer series',
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      restrictedWords: ['cheap', 'free'],
    },
  });

  assert.deepEqual(context, {
    voice: 'Warm, Intimate',
    language: 'French',
    toneShift: 'More editorial',
    audience: 'Design-conscious travellers',
    guardrailCount: 2,
    goal: 'Brand visibility',
    keyMessage: 'Craft-led summer series',
  });
});

test('buildManualBriefFromBrand preloads brand-kit defaults and leaves only campaign fields empty', () => {
  const brief = buildManualBriefFromBrand({
    id: 'brand-1',
    name: 'BHV Marais',
    language: 'French',
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      vocabulary: ['craft', 'neighbourhood'],
      restrictedWords: ['cheap'],
      channelRulesLinkedin: 'Hook in line 1',
      channelRulesBlog: 'Use subheadings',
      audienceType: '28-40 urban creatives',
      buyerSeniority: 'Manager',
      ageRange: '28-40',
      industrySector: 'Retail',
      industryTarget: 'Luxury retail',
      funnelStage: 'Top of funnel — awareness',
      toneShift: 'Keep baseline',
      proofStyle: 'Data-led',
      contentRole: 'Standalone / organic reach',
      contentGoal: 'Brand visibility',
      publishingFrequency: 'Weekly',
      voiceFormality: 3,
      campaignCoreWhy: 'Build anticipation.',
      pastContentExamples: 'Example',
      websiteUrl: 'https://example.com',
      websiteUrls: ['https://example.com', 'https://example.com/about'],
      websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
      guidelineFileUrl: 'https://cdn.example.com/guide.pdf',
      guidelineFileName: 'guide.pdf',
      guidelineStoragePath: 'brand-1/guide.pdf',
      guidelineTextExcerpt: 'Use neighbourhood-first language.',
    },
  });

  assert.deepEqual(brief, {
    mode: 'manual',
    brandId: 'brand-1',
    brandName: 'BHV Marais',
    language: 'French',
    campaignName: '',
    campaignType: '',
    audience: '28-40 urban creatives',
    audienceType: '28-40 urban creatives',
    toneShift: 'Keep baseline',
    funnelStage: 'Top of funnel — awareness',
    contentGoal: 'Brand visibility',
    publishingFrequency: 'Weekly',
    proofStyle: 'Data-led',
    contentRole: 'Standalone / organic reach',
    voiceFormality: 3,
    campaignCoreWhy: 'Build anticipation.',
    keyMessage: '',
    lowConfidence: false,
    sourceCardIds: [],
    sourceThreadIds: [],
    voiceAdjectives: ['Warm', 'Intimate'],
    restrictedWords: ['cheap'],
    kit: {
      voiceAdjectives: ['Warm', 'Intimate'],
      vocabulary: ['craft', 'neighbourhood'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Hook in line 1',
        blog: 'Use subheadings',
      },
      audienceType: '28-40 urban creatives',
      buyerSeniority: 'Manager',
      ageRange: '28-40',
      industrySector: 'Retail',
      industryTarget: 'Luxury retail',
      funnelStage: 'Top of funnel — awareness',
      toneShift: 'Keep baseline',
      proofStyle: 'Data-led',
      contentRole: 'Standalone / organic reach',
      contentGoal: 'Brand visibility',
      publishingFrequency: 'Weekly',
      voiceFormality: 3,
      campaignCoreWhy: 'Build anticipation.',
      pastContentExamples: 'Example',
      websiteUrl: 'https://example.com',
      websiteUrls: ['https://example.com', 'https://example.com/about'],
      websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
      guidelineFileUrl: 'https://cdn.example.com/guide.pdf',
      guidelineFileName: 'guide.pdf',
      guidelineStoragePath: 'brand-1/guide.pdf',
      guidelineTextExcerpt: 'Use neighbourhood-first language.',
    },
  });
});

test('isManualBriefReady only requires campaign-specific fields when brand defaults already exist', () => {
  assert.equal(
    isManualBriefReady({
      campaignName: 'Summer workshop series',
      campaignType: 'Product launch',
      keyMessage: 'Craft-led summer series',
      contentGoal: 'Brand visibility',
    }),
    true
  );

  assert.equal(
    isManualBriefReady({
      campaignName: '',
      campaignType: 'Product launch',
      keyMessage: 'Craft-led summer series',
      contentGoal: 'Brand visibility',
    }),
    false
  );
});
