import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCanonicalBrief } from './briefBuilder.js';

test('buildCanonicalBrief merges extracted fields with active kit context', () => {
  const brief = buildCanonicalBrief([
    {
      id: 'card-1',
      brand_id: 'brand-1',
      brand_name: 'BHV Marais',
      language: 'French',
      email_subject: 'Summer workshop series',
      excerpt: 'A neighbourhood-first summer launch.',
      overall_score: 0.82,
      thread_id: 'thread-1',
      extracted_fields: {
        campaignType: 'Product launch',
        audience: 'Design-aware Parisians',
        keyMessage: 'Craft-led summer series',
      },
      voice_adjectives: ['Warm', 'Intimate'],
      vocabulary: ['craft', 'neighbourhood'],
      restricted_words: ['cheap'],
      channel_rules_linkedin: 'Hook in line 1',
      channel_rules_blog: 'Use subheadings',
      audience_type: '28-40 urban creatives',
      buyer_seniority: 'Manager',
      age_range: '28-40',
      industry_sector: 'Retail',
      industry_target: 'Luxury retail',
      funnel_stage: 'Top of funnel — awareness',
      tone_shift: 'Keep baseline',
      proof_style: 'Data-led',
      content_role: 'Standalone / organic reach',
      content_goal: 'Brand visibility',
      publishing_frequency: 'Weekly',
      formality_level: 3,
      campaign_core_why: 'Build anticipation for the series.',
      past_content_examples: 'Example',
      website_url: 'https://example.com',
      website_urls: ['https://example.com', 'https://example.com/about'],
      website_summary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
      guideline_file_url: 'https://cdn.example.com/brand-guide.pdf',
      guideline_file_name: 'brand-guide.pdf',
      guideline_storage_path: 'brand-1/brand-guide.pdf',
      guideline_text_excerpt: 'Use neighbourhood-first language.',
      version: 2,
    },
  ], ['card-1']);

  assert.deepEqual(brief, {
    brandId: 'brand-1',
    brandName: 'BHV Marais',
    language: 'French',
    campaignName: 'Summer workshop series',
    campaignType: 'Product launch',
    audience: 'Design-aware Parisians',
    audienceType: '28-40 urban creatives',
    toneShift: 'Keep baseline',
    funnelStage: 'Top of funnel — awareness',
    contentGoal: 'Brand visibility',
    publishingFrequency: 'Weekly',
    proofStyle: 'Data-led',
    contentRole: 'Standalone / organic reach',
    voiceFormality: 3,
    campaignCoreWhy: 'Build anticipation for the series.',
    keyMessage: 'Craft-led summer series',
    lowConfidence: false,
    sourceCardIds: ['card-1'],
    sourceThreadIds: ['thread-1'],
    voiceAdjectives: ['Warm', 'Intimate'],
    restrictedWords: ['cheap'],
    kit: {
      version: 2,
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
      campaignCoreWhy: 'Build anticipation for the series.',
      pastContentExamples: 'Example',
      websiteUrl: 'https://example.com',
      websiteUrls: ['https://example.com', 'https://example.com/about'],
      websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
      guidelineFileUrl: 'https://cdn.example.com/brand-guide.pdf',
      guidelineFileName: 'brand-guide.pdf',
      guidelineStoragePath: 'brand-1/brand-guide.pdf',
      guidelineTextExcerpt: 'Use neighbourhood-first language.',
    },
  });
});

test('buildCanonicalBrief prefers extracted updates across multiple cards and flags low confidence', () => {
  const brief = buildCanonicalBrief([
    {
      id: 'card-1',
      brand_id: 'brand-1',
      brand_name: 'BHV Marais',
      language: 'French',
      email_subject: 'Older subject',
      overall_score: 0.2,
      thread_id: 'thread-1',
      extracted_fields: { campaignType: 'Awareness' },
      voice_adjectives: [],
      vocabulary: [],
      restricted_words: [],
    },
    {
      id: 'card-2',
      brand_id: 'brand-1',
      brand_name: 'BHV Marais',
      language: 'French',
      email_subject: 'Newer subject',
      overall_score: 0.2,
      thread_id: 'thread-1',
      extracted_fields: { keyMessage: 'Most recent message', audience: 'Creative audience' },
      voice_adjectives: [],
      vocabulary: [],
      restricted_words: [],
    },
  ], ['card-1', 'card-2']);

  assert.equal(brief.campaignType, 'Awareness');
  assert.equal(brief.keyMessage, 'Most recent message');
  assert.equal(brief.audience, 'Creative audience');
  assert.equal(brief.lowConfidence, true);
  assert.deepEqual(brief.sourceThreadIds, ['thread-1']);
});
