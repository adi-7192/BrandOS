import test from 'node:test';
import assert from 'node:assert/strict';

import { buildGuidelineDisplay } from './guideline-view.js';

test('buildGuidelineDisplay returns a concise user-facing message without exposing the raw excerpt', () => {
  const display = buildGuidelineDisplay({
    guidelineFileName: 'design doc.docx',
    guidelineTextExcerpt: 'STEP 1 - STEP 2 - LOGIN - GOOGLE AUTH + EMAIL SIGN UP SCREEN INITIAL DETAILS...',
  });

  assert.deepEqual(display, {
    title: 'Guidelines applied from design doc.docx',
    meta: 'Used to guide AI extraction and generation.',
    detailItems: ['File: design doc.docx'],
  });
});

test('buildGuidelineDisplay returns empty state values when no guideline file exists', () => {
  const display = buildGuidelineDisplay({
    guidelineFileName: '',
    guidelineTextExcerpt: 'Ignored because no file is attached.',
  });

  assert.deepEqual(display, {
    title: '',
    meta: '',
    detailItems: [],
  });
});
