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
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    proofStyle: 'Other',
    proofStyleOther: 'Founder quote-led with one strong stat',
  });

  assert.equal(request.isMultipart, false);
  assert.deepEqual(request.config, undefined);
  assert.equal(request.data.brandName, 'BHV Marais');
  assert.equal(request.data.websiteUrl, 'https://example.com');
  assert.deepEqual(request.data.websiteUrls, ['https://example.com', 'https://example.com/about']);
  assert.equal(request.data.audienceType, 'Urban creatives');
  assert.deepEqual(request.data.funnelStages, ['Top of funnel — awareness', 'Mid funnel — consideration']);
  assert.equal(request.data.proofStyle, 'Founder quote-led with one strong stat');
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
    funnelStages: ['Top of funnel — awareness', 'Mid funnel — consideration'],
    proofStyle: 'Other',
    proofStyleOther: 'Founder quote-led with one strong stat',
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
