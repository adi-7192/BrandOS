import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCampaignFilters,
  buildCampaignCards,
  filterCampaigns,
} from './campaigns-view.js';

const campaigns = [
  {
    id: 'campaign-1',
    brandName: 'BHV Marais',
    campaignName: 'Summer Workshop Series',
    campaignType: 'Product launch',
    toneShift: 'Warm, neighbourhood-first',
    keyMessage: 'Discover local makers through hands-on workshops.',
    status: 'active',
    statusLabel: 'Active',
    currentStepLabel: 'Generated output',
    publishDate: '2026-04-18',
    updatedAt: '2026-04-09T09:00:00.000Z',
    channels: ['LinkedIn', 'Blog'],
    outputs: {
      linkedin: 'ready',
      blog: 'draft',
    },
    progressPercent: 75,
    brandHref: '/settings/brands/brand-1',
    resumeHref: '/generate/output?sessionId=campaign-1',
  },
  {
    id: 'campaign-2',
    brandName: 'La Redoute',
    campaignName: 'Back to School Push',
    campaignType: 'Seasonal campaign',
    toneShift: 'Practical and aspirational',
    keyMessage: 'Make back-to-school effortless for modern families.',
    status: 'draft',
    statusLabel: 'Draft',
    currentStepLabel: 'Preview in progress',
    publishDate: '2026-04-20',
    updatedAt: '2026-04-08T09:00:00.000Z',
    channels: [],
    outputs: {
      linkedin: 'empty',
      blog: 'empty',
    },
    progressPercent: 45,
    brandHref: '/settings/brands/brand-2',
    resumeHref: '/generate/preview?sessionId=campaign-2',
  },
  {
    id: 'campaign-3',
    brandName: 'Sezane',
    campaignName: 'Spring Essentials',
    campaignType: 'Brand awareness',
    toneShift: 'Elegant and restrained',
    keyMessage: 'Fresh starts for the whole family.',
    status: 'completed',
    statusLabel: 'Completed',
    currentStepLabel: 'Generated output',
    publishDate: '2026-04-11',
    updatedAt: '2026-04-07T09:00:00.000Z',
    channels: ['LinkedIn', 'Blog'],
    outputs: {
      linkedin: 'ready',
      blog: 'ready',
    },
    progressPercent: 100,
    brandHref: '/settings/brands/brand-3',
    resumeHref: '/generate/output?sessionId=campaign-3',
  },
];

test('buildCampaignFilters counts campaign statuses for the tabs', () => {
  assert.deepEqual(buildCampaignFilters(campaigns), [
    { id: 'all', label: 'All', count: 3 },
    { id: 'active', label: 'Active', count: 1 },
    { id: 'draft', label: 'Draft', count: 1 },
    { id: 'completed', label: 'Completed', count: 1 },
  ]);
});

test('filterCampaigns matches search across campaign and brand fields while respecting status tabs', () => {
  assert.deepEqual(
    filterCampaigns(campaigns, { activeFilter: 'active', searchQuery: 'bhv' }).map((campaign) => campaign.id),
    ['campaign-1']
  );

  assert.deepEqual(
    filterCampaigns(campaigns, { activeFilter: 'all', searchQuery: 'seasonal' }).map((campaign) => campaign.id),
    ['campaign-2']
  );
});

test('buildCampaignCards creates card-ready models with quick actions and output status pills', () => {
  assert.deepEqual(
    buildCampaignCards([campaigns[0]])[0],
    {
      id: 'campaign-1',
      title: 'Summer Workshop Series',
      brandName: 'BHV Marais',
      statusLabel: 'Active',
      statusTone: 'green',
      typeLabel: 'Product launch',
      publishLabel: 'Apr 18, 2026',
      stepLabel: 'Generated output',
      toneLabel: 'Warm, neighbourhood-first',
      keyMessage: 'Discover local makers through hands-on workshops.',
      channelsLabel: 'LinkedIn, Blog',
      progressPercent: 75,
      outputs: [
        { id: 'linkedin', label: 'LinkedIn', stateLabel: 'Ready', stateTone: 'green' },
        { id: 'blog', label: 'Blog', stateLabel: 'Draft', stateTone: 'amber' },
      ],
      primaryAction: { label: 'Open output', href: '/generate/output?sessionId=campaign-1' },
      secondaryAction: { label: 'View brand', href: '/settings/brands/brand-1' },
      updatedLabel: 'Updated 2026-04-09',
    }
  );
});
