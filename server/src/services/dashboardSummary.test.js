import test from 'node:test';
import assert from 'node:assert/strict';

import { mapDashboardBrandRows } from './dashboardSummary.js';

test('mapDashboardBrandRows exposes a simple guideline-document signal for dashboard brands', () => {
  const brands = mapDashboardBrandRows([
    {
      id: 'brand-1',
      name: 'Atlas',
      market: 'France',
      language: 'French',
      updated_at: '2026-04-08T10:00:00.000Z',
      voice_adjectives: ['Warm'],
      pending_brief_count: '2',
      guideline_file_name: 'brand-guide.pdf',
    },
    {
      id: 'brand-2',
      name: 'Northstar',
      market: 'Germany',
      language: 'German',
      updated_at: '2026-04-08T09:00:00.000Z',
      voice_adjectives: [],
      pending_brief_count: '0',
      guideline_file_name: null,
    },
  ]);

  assert.deepEqual(brands, [
    {
      id: 'brand-1',
      name: 'Atlas',
      market: 'France',
      language: 'French',
      updatedAt: '2026-04-08T10:00:00.000Z',
      voiceAdjectives: ['Warm'],
      pendingBriefCount: 2,
      hasGuidelineDocument: true,
    },
    {
      id: 'brand-2',
      name: 'Northstar',
      market: 'Germany',
      language: 'German',
      updatedAt: '2026-04-08T09:00:00.000Z',
      voiceAdjectives: [],
      pendingBriefCount: 0,
      hasGuidelineDocument: false,
    },
  ]);
});
