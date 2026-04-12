import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOnboardingSavePayload,
  shouldClearAuthOnError,
} from './onboarding-flow.js';

test('buildOnboardingSavePayload includes onboarding and kit fields expected by the server', () => {
  const payload = buildOnboardingSavePayload({
    role: 'Content Marketing Lead',
    team: 'Brand and Content',
    brandCount: '3–4',
    brandName: 'BHV Marais',
    primaryMarket: 'France',
    brandLanguage: 'French',
    websiteUrl: 'https://example.com',
    websiteUrls: ['https://example.com', 'https://example.com/about'],
    websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
    pastContentExamples: 'Example copy',
    guidelineFileUrl: 'https://cdn.example.com/brand-guide.pdf',
    guidelineFileName: 'brand-guide.pdf',
    guidelineStoragePath: 'user-1/brand-guide.pdf',
    guidelineTextExcerpt: 'Use neighbourhood-first language.',
    audienceType: 'Young professionals',
    audienceTypeOther: '',
    buyerSeniority: 'Manager',
    ageRange: '25–34',
    industrySector: 'Retail',
    industryTarget: 'Retail and e-commerce',
    industryTargetOther: '',
    audiencePainPoint: 'Scaling content without losing quality',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    toneShiftOther: '',
    proofStyle: 'Other',
    proofStyleOther: 'Founder quote-led with one strong stat',
    contentGoal: 'Brand visibility',
    contentGoalOther: '',
    ctaStyle: 'Book a demo or schedule a call',
    ctaStyleOther: '',
    emojiUsage: 'Sparingly — 1–2 per post maximum',
    publishingFrequency: 'Weekly',
    voiceFormality: 3,
    campaignCoreWhy: 'Spring should feel elevated, not promotional.',
    kitCards: {
      voiceAdjectives: ['Warm', 'Confident'],
      vocabulary: ['community'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Keep it short',
        blog: 'Use subheadings',
      },
    },
  });

  assert.deepEqual(payload, {
    role: 'Content Marketing Lead',
    team: 'Brand and Content',
    brandCount: '3–4',
    brandName: 'BHV Marais',
    primaryMarket: 'France',
    brandLanguage: 'French',
    websiteUrl: 'https://example.com',
    websiteUrls: ['https://example.com', 'https://example.com/about'],
    websiteSummary: 'Website evidence summary:\n- https://example.com/about :: Premium department store with editorial storytelling.',
    pastContentExamples: 'Example copy',
    guidelineFileUrl: 'https://cdn.example.com/brand-guide.pdf',
    guidelineFileName: 'brand-guide.pdf',
    guidelineStoragePath: 'user-1/brand-guide.pdf',
    guidelineTextExcerpt: 'Use neighbourhood-first language.',
    audienceType: 'Young professionals',
    buyerSeniority: 'Manager',
    ageRange: '25–34',
    industrySector: 'Retail',
    industryTarget: 'Retail and e-commerce',
    audiencePainPoint: 'Scaling content without losing quality',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    proofStyle: 'Founder quote-led with one strong stat',
    contentGoal: 'Brand visibility',
    ctaStyle: 'Book a demo or schedule a call',
    emojiUsage: 'Sparingly — 1–2 per post maximum',
    publishingFrequency: 'Weekly',
    voiceFormality: 3,
    campaignCoreWhy: 'Spring should feel elevated, not promotional.',
    kitCards: {
      voiceAdjectives: ['Warm', 'Confident'],
      vocabulary: ['community'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Keep it short',
        blog: 'Use subheadings',
      },
    },
  });
});

test('buildOnboardingSavePayload resolves custom audience and industry Other values', () => {
  const payload = buildOnboardingSavePayload({
    audienceType: "Custom — I'll describe my audience",
    audienceTypeOther: 'Independent fashion retailers aged 28–45',
    industryTarget: "Other — I'll describe it",
    industryTargetOther: 'Independent art galleries and creative studios',
    toneShift: 'Other',
    toneShiftOther: 'More provocative — challenge conventional thinking',
    contentGoal: 'Other',
    contentGoalOther: 'Build trust with first-time buyers',
    ctaStyle: 'Other',
    ctaStyleOther: 'Soft nudge — invite a reply',
    proofStyle: 'Data-led — statistics and research',
    proofStyleOther: '',
    funnelStages: [],
    websiteUrls: [],
    kitCards: null,
  });

  assert.equal(payload.audienceType, 'Independent fashion retailers aged 28–45');
  assert.equal(payload.industryTarget, 'Independent art galleries and creative studios');
  assert.equal(payload.toneShift, 'More provocative — challenge conventional thinking');
  assert.equal(payload.contentGoal, 'Build trust with first-time buyers');
  assert.equal(payload.ctaStyle, 'Soft nudge — invite a reply');
  assert.equal(payload.proofStyle, 'Data-led — statistics and research');
});

test('buildOnboardingSavePayload falls back to safe default kit cards when extraction has not populated them', () => {
  const payload = buildOnboardingSavePayload({
    role: '',
    team: '',
    brandCount: '',
    brandName: 'BHV Marais',
    primaryMarket: 'France',
    brandLanguage: 'French',
    websiteUrl: '',
    websiteUrls: [],
    websiteSummary: '',
    pastContentExamples: '',
    guidelineFileUrl: '',
    guidelineFileName: '',
    guidelineStoragePath: '',
    guidelineTextExcerpt: '',
    audienceType: '',
    audienceTypeOther: '',
    buyerSeniority: '',
    ageRange: '',
    industrySector: '',
    industryTarget: '',
    industryTargetOther: '',
    audiencePainPoint: '',
    funnelStages: [],
    toneShift: '',
    toneShiftOther: '',
    proofStyle: '',
    proofStyleOther: '',
    contentGoal: '',
    contentGoalOther: '',
    ctaStyle: '',
    ctaStyleOther: '',
    emojiUsage: '',
    publishingFrequency: 'Weekly',
    voiceFormality: null,
    campaignCoreWhy: '',
    kitCards: null,
  });

  assert.deepEqual(payload.kitCards, {
    voiceAdjectives: ['Authentic', 'Confident', 'Approachable'],
    vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
    restrictedWords: ['cheap', 'free', 'guarantee', 'best'],
    channelRules: {
      linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
      blog: '700–900 words · Subheadings required · End with a question or call to action',
    },
  });
});

test('shouldClearAuthOnError returns true for auth token failures and auth me requests', () => {
  assert.equal(
    shouldClearAuthOnError({
      config: { url: '/auth/me' },
      response: { status: 401, data: { message: 'Token invalid or expired.' } },
    }),
    true
  );

  assert.equal(
    shouldClearAuthOnError({
      config: { url: '/brands' },
      response: { status: 401, data: { message: 'Unauthorised.' } },
    }),
    true
  );
});

test('shouldClearAuthOnError returns false for non-auth server failures', () => {
  assert.equal(
    shouldClearAuthOnError({
      config: { url: '/onboarding/save-kit' },
      response: { status: 500, data: { message: 'Failed to save kit.' } },
    }),
    false
  );

  assert.equal(
    shouldClearAuthOnError({
      config: { url: '/brands' },
      response: { status: 400, data: { message: 'Bad request.' } },
    }),
    false
  );
});
