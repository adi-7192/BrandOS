import test from 'node:test';
import assert from 'node:assert/strict';

import { collectGuidelineStoragePaths } from './brandDeletion.js';

test('collectGuidelineStoragePaths keeps only unique non-empty storage paths', () => {
  assert.deepEqual(
    collectGuidelineStoragePaths([
      { guideline_storage_path: 'brand-1/a.pdf' },
      { guideline_storage_path: null },
      { guideline_storage_path: 'brand-1/a.pdf' },
      { guideline_storage_path: 'brand-1/b.docx' },
      { guideline_storage_path: '' },
    ]),
    ['brand-1/a.pdf', 'brand-1/b.docx']
  );
});
