import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGuidelineExcerpt,
  extractGuidelineText,
  normalizeGuidelineText,
} from './guidelineText.js';

test('normalizeGuidelineText collapses whitespace and removes blank lines', () => {
  assert.equal(
    normalizeGuidelineText('Brand voice\n\nWarm   and   confident\n\n\nAvoid hype'),
    'Brand voice\nWarm and confident\nAvoid hype'
  );
});

test('buildGuidelineExcerpt limits text size while preserving beginning of document', () => {
  const excerpt = buildGuidelineExcerpt('A'.repeat(1400), 200);
  assert.equal(excerpt.length, 200);
});

test('extractGuidelineText uses the DOCX extractor for docx files', async () => {
  const result = await extractGuidelineText({
    buffer: Buffer.from('docx'),
    filename: 'guide.docx',
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dependencies: {
      extractDocx: async () => 'Warm and confident\n\nAvoid hype',
      extractPdf: async () => 'wrong parser',
    },
  });

  assert.equal(result.text, 'Warm and confident\nAvoid hype');
  assert.equal(result.excerpt, 'Warm and confident\nAvoid hype');
});

test('extractGuidelineText uses the PDF extractor for pdf files', async () => {
  const result = await extractGuidelineText({
    buffer: Buffer.from('pdf'),
    filename: 'guide.pdf',
    mimetype: 'application/pdf',
    dependencies: {
      extractDocx: async () => 'wrong parser',
      extractPdf: async () => 'Evidence-based tone only',
    },
  });

  assert.equal(result.text, 'Evidence-based tone only');
});

test('extractGuidelineText rejects unsupported file types', async () => {
  await assert.rejects(
    () => extractGuidelineText({
      buffer: Buffer.from('txt'),
      filename: 'guide.txt',
      mimetype: 'text/plain',
    }),
    /Unsupported guideline file type/
  );
});
