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
    funnelStage: 'Top of funnel — awareness',
    toneShift: 'Keep baseline — no shift',
    proofStyle: 'Data-led — statistics and research',
    contentRole: 'Standalone / organic reach',
    contentGoal: 'Brand visibility',
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
    funnelStage: 'Top of funnel — awareness',
    toneShift: 'Keep baseline — no shift',
    proofStyle: 'Data-led — statistics and research',
    contentRole: 'Standalone / organic reach',
    contentGoal: 'Brand visibility',
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

test('buildOnboardingSavePayload falls back to safe default kit cards when extraction has not populated them', () => {
  const payload = buildOnboardingSavePayload({
    role: '',
    team: '',
    brandCount: '',
    brandName: 'BHV Marais',
    primaryMarket: 'France',
    brandLanguage: 'French',
    websiteUrl: '',
    pastContentExamples: '',
    guidelineFileUrl: '',
    guidelineFileName: '',
    guidelineStoragePath: '',
    guidelineTextExcerpt: '',
    audienceType: '',
    buyerSeniority: '',
    ageRange: '',
    industrySector: '',
    industryTarget: '',
    funnelStage: '',
    toneShift: '',
    proofStyle: '',
    contentRole: '',
    contentGoal: '',
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
