import test from 'node:test';
import assert from 'node:assert/strict';

import { buildExtractKitRequest } from './onboarding-extraction.js';

test('buildExtractKitRequest returns JSON payload when no guideline file is present', () => {
  const request = buildExtractKitRequest({
    brandName: 'BHV Marais',
    websiteUrl: 'https://example.com',
    pastContentExamples: 'Example',
    brandGuidelinesFile: null,
    audienceType: 'Urban creatives',
  });

  assert.equal(request.isMultipart, false);
  assert.deepEqual(request.config, undefined);
  assert.equal(request.data.brandName, 'BHV Marais');
  assert.equal(request.data.websiteUrl, 'https://example.com');
  assert.equal(request.data.audienceType, 'Urban creatives');
});

test('buildExtractKitRequest returns multipart payload when a guideline file is present', () => {
  const file = new File(['guideline text'], 'brand-guide.docx', {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const request = buildExtractKitRequest({
    brandName: 'BHV Marais',
    websiteUrl: '',
    pastContentExamples: 'Example',
    brandGuidelinesFile: file,
    audienceType: 'Urban creatives',
  });

  assert.equal(request.isMultipart, true);
  assert.equal(request.config.headers['Content-Type'], 'multipart/form-data');
  assert.equal(request.data instanceof FormData, true);
  assert.equal(request.data.get('brandName'), 'BHV Marais');
  assert.equal(request.data.get('pastContentExamples'), 'Example');
  assert.equal(request.data.get('audienceType'), 'Urban creatives');
  assert.equal(request.data.get('brandGuidelinesFile').name, 'brand-guide.docx');
});
