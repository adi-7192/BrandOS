import test from 'node:test';
import assert from 'node:assert/strict';

import { buildExtractKitRequest } from './onboarding-extraction.js';

test('buildExtractKitRequest returns JSON payload when no guideline file is present', () => {
  const request = buildExtractKitRequest({
    brandName: 'BHV Marais',
    websiteUrl: 'https://example.com',
    websiteUrls: ['https://example.com', 'https://example.com/about'],
    pastContentExamples: 'Example',
    brandGuidelinesFile: null,
    audienceType: 'Urban creatives',
    audienceTypeOther: '',
    industryTarget: 'Media and entertainment',
    industryTargetOther: '',
    audiencePainPoint: 'Standing out in a saturated content landscape',
    campaignType: 'Brand awareness',
    campaignTypeOther: '',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    toneShiftOther: '',
    proofStyle: 'Other',
    proofStyleOther: 'Founder quote-led with one strong stat',
    contentGoal: 'Brand visibility',
    contentGoalOther: '',
    ctaStyle: 'Follow for more',
    ctaStyleOther: '',
    emojiUsage: 'Sparingly — 1–2 per post maximum',
  });

  assert.equal(request.isMultipart, false);
  assert.deepEqual(request.config, undefined);
  assert.equal(request.data.brandName, 'BHV Marais');
  assert.equal(request.data.websiteUrl, 'https://example.com');
  assert.deepEqual(request.data.websiteUrls, ['https://example.com', 'https://example.com/about']);
  assert.equal(request.data.audienceType, 'Urban creatives');
  assert.equal(request.data.audiencePainPoint, 'Standing out in a saturated content landscape');
  assert.deepEqual(request.data.funnelStages, ['Top of funnel — awareness', 'Mid funnel — consideration']);
  assert.equal(request.data.proofStyle, 'Founder quote-led with one strong stat');
  assert.equal(request.data.ctaStyle, 'Follow for more');
  assert.equal(request.data.emojiUsage, 'Sparingly — 1–2 per post maximum');
});

test('buildExtractKitRequest resolves Other fields before sending', () => {
  const request = buildExtractKitRequest({
    brandName: 'BHV Marais',
    websiteUrl: '',
    websiteUrls: [],
    brandGuidelinesFile: null,
    audienceType: "Custom — I'll describe my audience",
    audienceTypeOther: 'Independent fashion retailers aged 28–45',
    industryTarget: "Other — I'll describe it",
    industryTargetOther: 'Independent art galleries',
    campaignType: 'Other',
    campaignTypeOther: 'Partner activation series',
    toneShift: 'Other',
    toneShiftOther: 'More provocative',
    contentGoal: 'Other',
    contentGoalOther: 'Build first-time buyer trust',
    ctaStyle: 'Other',
    ctaStyleOther: 'Soft nudge — invite a reply',
    proofStyle: 'Data-led — statistics and research',
    proofStyleOther: '',
    funnelStages: [],
  });

  assert.equal(request.data.audienceType, 'Independent fashion retailers aged 28–45');
  assert.equal(request.data.industryTarget, 'Independent art galleries');
  assert.equal(request.data.campaignType, 'Partner activation series');
  assert.equal(request.data.toneShift, 'More provocative');
  assert.equal(request.data.contentGoal, 'Build first-time buyer trust');
  assert.equal(request.data.ctaStyle, 'Soft nudge — invite a reply');
});

test('buildExtractKitRequest returns multipart payload when a guideline file is present', () => {
  const file = new File(['guideline text'], 'brand-guide.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const request = buildExtractKitRequest({
    brandName: 'BHV Marais',
    websiteUrl: 'https://example.com',
    websiteUrls: ['https://example.com', 'https://example.com/about'],
    pastContentExamples: 'Example',
    brandGuidelinesFile: file,
    audienceType: 'Urban creatives',
    audienceTypeOther: '',
    industryTarget: 'Media and entertainment',
    industryTargetOther: '',
    audiencePainPoint: '',
    campaignType: 'Brand awareness',
    campaignTypeOther: '',
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    toneShift: 'Keep baseline — no shift',
    toneShiftOther: '',
    proofStyle: 'Other',
    proofStyleOther: 'Founder quote-led with one strong stat',
    contentGoal: 'Brand visibility',
    contentGoalOther: '',
    ctaStyle: '',
    ctaStyleOther: '',
    emojiUsage: '',
  });

  assert.equal(request.isMultipart, true);
  assert.equal(request.config.headers['Content-Type'], 'multipart/form-data');
  assert.equal(request.data instanceof FormData, true);
  assert.equal(request.data.get('brandName'), 'BHV Marais');
  assert.equal(request.data.get('websiteUrl'), 'https://example.com');
  assert.equal(request.data.get('websiteUrls'), JSON.stringify(['https://example.com', 'https://example.com/about']));
  assert.equal(request.data.get('pastContentExamples'), 'Example');
  assert.equal(request.data.get('audienceType'), 'Urban creatives');
  assert.equal(request.data.get('funnelStages'), JSON.stringify(['Top of funnel — awareness', 'Mid funnel — consideration']));
  assert.equal(request.data.get('proofStyle'), 'Founder quote-led with one strong stat');
  assert.equal(request.data.get('brandGuidelinesFile').name, 'brand-guide.docx');
});
