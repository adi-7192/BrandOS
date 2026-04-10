import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBriefOriginMeta,
  hasPreviewContent,
  buildConfirmedBrief,
  buildGeneratingContext,
  buildManualBriefFromBrand,
  buildSampleBrief,
  buildSampleOutput,
  buildSamplePreviewSections,
  mergePreviewSuggestions,
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
    publishDate: '',
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
      funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
      funnelStage: 'Top of funnel — awareness',
      toneShift: 'Keep baseline',
      proofStyle: 'Data-led',
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
    publishDate: '',
    audience: '28-40 urban creatives',
    audienceType: '28-40 urban creatives',
    toneShift: 'Keep baseline',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    funnelStage: 'Top of funnel — awareness · Mid funnel — consideration',
    contentGoal: 'Brand visibility',
    publishingFrequency: 'Weekly',
    proofStyle: 'Data-led',
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
      funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
      funnelStage: 'Top of funnel — awareness · Mid funnel — consideration',
      toneShift: 'Keep baseline',
      proofStyle: 'Data-led',
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

test('mergePreviewSuggestions fills blank preview sections without overwriting user edits', () => {
  const merged = mergePreviewSuggestions(
    {
      linkedin: {
        hook: '',
        body: 'User body',
        closing: '',
        hashtags: '',
      },
      blog: {
        headline: '',
        opening: '',
        body: '',
        closing: '',
      },
    },
    {
      linkedin: {
        hook: 'AI hook',
        body: 'AI body',
        closing: 'AI closing',
        hashtags: '#moodway #retail',
      },
      blog: {
        headline: 'AI headline',
        opening: 'AI opening',
        body: 'AI blog body',
        closing: 'AI blog closing',
      },
    }
  );

  assert.deepEqual(merged, {
    linkedin: {
      hook: 'AI hook',
      body: 'User body',
      closing: 'AI closing',
      hashtags: '#moodway #retail',
    },
    blog: {
      headline: 'AI headline',
      opening: 'AI opening',
      body: 'AI blog body',
      closing: 'AI blog closing',
    },
  });
});

test('hasPreviewContent ignores placeholder hashtags and only treats meaningful draft text as content', () => {
  assert.equal(
    hasPreviewContent(
      {
        linkedin: {
          hook: '',
          body: '',
          closing: '',
          hashtags: '#brand #content #marketing',
        },
      },
      'linkedin'
    ),
    false
  );

  assert.equal(
    hasPreviewContent(
      {
        linkedin: {
          hook: 'A stronger opening line',
          body: '',
          closing: '',
          hashtags: '#brand #content #marketing',
        },
      },
      'linkedin'
    ),
    true
  );
});

test('buildBriefOriginMeta explains whether the current brief came from inbox, manual setup, or sample data', () => {
  assert.deepEqual(
    buildBriefOriginMeta({
      sourceCardIds: ['card-1'],
      brandName: 'BHV Marais',
    }),
    {
      label: 'Inbox brief',
      badge: 'From inbox',
      description: 'This brief came from a stakeholder update that BrandOS extracted into a campaign draft.',
    }
  );

  assert.deepEqual(
    buildBriefOriginMeta({
      mode: 'manual',
      brandName: 'BHV Marais',
    }),
    {
      label: 'Manual brief',
      badge: 'Manual setup',
      description: 'This campaign was started manually using your saved brand-kit defaults as the starting point.',
    }
  );

  assert.deepEqual(
    buildBriefOriginMeta({
      mode: 'sample',
      brandName: 'Moodway',
    }),
    {
      label: 'Sample workflow',
      badge: 'Example data',
      description: 'This is a guided example so you can see how BrandOS moves from brief to final content before your real inbox is connected.',
    }
  );
});

test('buildSampleBrief returns a safe sample brief with kit context for zero-data walkthroughs', () => {
  const brief = buildSampleBrief();

  assert.equal(brief.mode, 'sample');
  assert.equal(brief.brandName, 'Moodway');
  assert.equal(brief.campaignName, 'Virtual try-on launch');
  assert.equal(brief.contentGoal, 'Product awareness');
  assert.equal(Array.isArray(brief.kit.voiceAdjectives), true);
  assert.equal(brief.sourceCardIds.length, 1);
});

test('buildSampleOutput returns ready-to-read example linkedin and blog drafts', () => {
  const output = buildSampleOutput();

  assert.equal(typeof output.linkedin, 'string');
  assert.equal(typeof output.blog, 'string');
  assert.equal(output.linkedin.includes('virtual try-on'), true);
  assert.equal(output.blog.includes('Moodway'), true);
});

test('buildSamplePreviewSections returns preview-ready sample sections for both formats', () => {
  const sections = buildSamplePreviewSections();

  assert.equal(sections.linkedin.hook.includes('virtual try-on'), true);
  assert.equal(sections.blog.headline.includes('Moodway'), true);
});
