import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildBrandPortfolioRows,
  buildBriefActionItems,
  buildContinueWorkingItems,
  buildDashboardStats,
  buildDraftOutputState,
  buildRecentActivity,
  buildUpcomingDeadlineItems,
} from './dashboard-flow.js';

test('buildDashboardStats returns the refreshed KPI row', () => {
  const stats = buildDashboardStats({
    counts: {
      brands: 5,
      pendingBriefs: 3,
      brandsInPipeline: 2,
      recentDrafts: 9,
    },
  });

  assert.deepEqual(stats, [
    {
      label: 'Brand Kits',
      value: 5,
      note: '5 live brands',
      tone: 'neutral',
      icon: 'layers',
    },
    {
      label: 'Pending Briefs',
      value: 3,
      note: '3 ready to review',
      tone: 'blue',
      icon: 'inbox',
    },
    {
      label: 'Brands in Pipeline',
      value: 2,
      note: '2 brands with active work',
      tone: 'green',
      icon: 'draft',
    },
    {
      label: 'Saved Drafts',
      value: 9,
      note: 'Recent outputs ready to reopen',
      tone: 'amber',
      icon: 'bookmark',
    },
  ]);
});

test('buildUpcomingDeadlineItems sorts deadlines by publish date and adds urgency states', () => {
  const items = buildUpcomingDeadlineItems({
    upcomingDeadlines: [
      {
        id: 'session-1',
        kind: 'session',
        title: 'Fall collection launch',
        brandName: 'Northstar',
        publishDate: '2026-04-10',
        stateLabel: 'In progress',
        currentStep: 'preview',
      },
      {
        id: 'brief-1',
        kind: 'brief',
        title: 'Summer workshop content',
        brandName: 'Atlas',
        publishDate: '2026-04-09',
        stateLabel: 'Pending brief',
      },
      {
        id: 'brief-2',
        kind: 'brief',
        title: 'Press teaser',
        brandName: 'BHV Marais',
        publishDate: '2026-04-18',
        stateLabel: 'Pending brief',
      },
    ],
  }, new Date('2026-04-09T09:00:00.000Z'));

  assert.deepEqual(items, [
    {
      id: 'brief-1',
      kind: 'brief',
      title: 'Summer workshop content',
      brandName: 'Atlas',
      publishDate: '2026-04-09',
      stateLabel: 'Pending brief',
      urgencyLabel: 'Due today',
      urgencyTone: 'red',
    },
    {
      id: 'session-1',
      kind: 'session',
      title: 'Fall collection launch',
      brandName: 'Northstar',
      publishDate: '2026-04-10',
      stateLabel: 'In progress',
      currentStep: 'preview',
      urgencyLabel: 'Due tomorrow',
      urgencyTone: 'amber',
    },
    {
      id: 'brief-2',
      kind: 'brief',
      title: 'Press teaser',
      brandName: 'BHV Marais',
      publishDate: '2026-04-18',
      stateLabel: 'Pending brief',
      urgencyLabel: 'Due Apr 18',
      urgencyTone: 'neutral',
    },
  ]);
});

test('buildBriefActionItems ranks recent pending briefs and derives a quality label', () => {
  const items = buildBriefActionItems({
    pendingBriefs: [
      {
        id: 'brief-older',
        brandName: 'Atlas',
        emailSubject: 'Autumn push',
        matchedFields: ['goal'],
        createdAt: '2026-04-07T09:00:00.000Z',
      },
      {
        id: 'brief-newer',
        brandName: 'Northstar',
        emailSubject: 'Summer workshop series',
        matchedFields: ['goal', 'audience', 'channel'],
        createdAt: '2026-04-08T11:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(items, [
    {
      id: 'brief-newer',
      kind: 'brief',
      title: 'Summer workshop series',
      brandName: 'Northstar',
      meta: '3 fields found',
      qualityLabel: 'High match',
      qualityTone: 'green',
      createdAt: '2026-04-08T11:00:00.000Z',
      actionLabel: 'Open brief',
    },
    {
      id: 'brief-older',
      kind: 'brief',
      title: 'Autumn push',
      brandName: 'Atlas',
      meta: '1 field found',
      qualityLabel: 'Needs review',
      qualityTone: 'amber',
      createdAt: '2026-04-07T09:00:00.000Z',
      actionLabel: 'Open brief',
    },
  ]);
});

test('buildContinueWorkingItems combines sessions and drafts in one sorted list', () => {
  const items = buildContinueWorkingItems({
    recentSessions: [
      {
        id: 'session-1',
        brandName: 'Atlas',
        sessionTitle: 'Spring launch',
        currentStep: 'preview',
        updatedAt: '2026-04-08T10:00:00.000Z',
      },
    ],
    recentDrafts: [
      {
        id: 'draft-1',
        brandName: 'Atlas',
        format: 'blog',
        createdAt: '2026-04-08T09:30:00.000Z',
      },
      {
        id: 'draft-2',
        brandName: 'Northstar',
        format: 'linkedin',
        createdAt: '2026-04-08T11:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(items, [
    {
      id: 'draft-2',
      kind: 'draft',
      title: 'LinkedIn draft',
      brandName: 'Northstar',
      itemType: 'Saved draft',
      updatedAt: '2026-04-08T11:00:00.000Z',
      actionLabel: 'Open draft',
    },
    {
      id: 'session-1',
      kind: 'session',
      title: 'Spring launch',
      brandName: 'Atlas',
      itemType: 'Live session',
      updatedAt: '2026-04-08T10:00:00.000Z',
      actionLabel: 'Resume session',
    },
    {
      id: 'draft-1',
      kind: 'draft',
      title: 'Blog draft',
      brandName: 'Atlas',
      itemType: 'Saved draft',
      updatedAt: '2026-04-08T09:30:00.000Z',
      actionLabel: 'Open draft',
    },
  ]);
});

test('buildBrandPortfolioRows sorts brands with pending work first and marks status', () => {
  const rows = buildBrandPortfolioRows({
    brands: [
      {
        id: 'brand-1',
        name: 'Atlas',
        market: 'France',
        language: 'French',
        voiceAdjectives: ['Warm', 'Direct'],
        pendingBriefCount: 2,
        updatedAt: '2026-04-06T10:00:00.000Z',
      },
      {
        id: 'brand-2',
        name: 'Northstar',
        market: 'Germany',
        language: 'German',
        voiceAdjectives: [],
        pendingBriefCount: 0,
        updatedAt: '2026-04-08T10:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(rows, [
    {
      id: 'brand-1',
      name: 'Atlas',
      descriptor: 'France · French',
      toneSummary: 'Warm, Direct',
      statusLabel: 'Active',
      statusTone: 'green',
      pendingBriefLabel: '2 pending briefs',
      pendingBriefCount: 2,
      href: '/settings/brands/brand-1',
      actionLabel: 'Open kit',
    },
    {
      id: 'brand-2',
      name: 'Northstar',
      descriptor: 'Germany · German',
      toneSummary: 'Voice still being defined',
      statusLabel: 'Draft',
      statusTone: 'amber',
      pendingBriefLabel: 'Queue clear',
      pendingBriefCount: 0,
      href: '/settings/brands/brand-2',
      actionLabel: 'Open kit',
    },
  ]);
});

test('buildRecentActivity keeps the newest five activity items', () => {
  const items = buildRecentActivity({
    recentSessions: [
      {
        id: 'session-1',
        sessionTitle: 'Spring launch',
        brandName: 'Atlas',
        updatedAt: '2026-04-08T11:00:00.000Z',
      },
    ],
    pendingBriefs: [
      {
        id: 'brief-1',
        emailSubject: 'Summer launch brief',
        createdAt: '2026-04-08T10:00:00.000Z',
      },
    ],
    recentDrafts: [
      {
        id: 'draft-1',
        brandName: 'Atlas',
        format: 'blog',
        createdAt: '2026-04-08T09:00:00.000Z',
      },
      {
        id: 'draft-2',
        brandName: 'Northstar',
        format: 'linkedin',
        createdAt: '2026-04-08T08:00:00.000Z',
      },
    ],
    brands: [
      {
        id: 'brand-1',
        name: 'Atlas',
        updatedAt: '2026-04-08T07:00:00.000Z',
      },
      {
        id: 'brand-2',
        name: 'Northstar',
        updatedAt: '2026-04-08T06:00:00.000Z',
      },
    ],
  });

  assert.deepEqual(items.map((item) => item.id), [
    'session-session-1',
    'brief-brief-1',
    'draft-draft-1',
    'draft-draft-2',
    'brand-brand-1',
  ]);
});

test('buildDraftOutputState maps a saved draft into output route state', () => {
  const routeState = buildDraftOutputState({
    id: 'draft-1',
    brandId: 'brand-1',
    brandName: 'BHV Marais',
    language: 'French',
    format: 'linkedin',
    content: 'Saved LinkedIn draft',
  });

  assert.deepEqual(routeState, {
    activeTab: 'linkedin',
    output: {
      linkedin: 'Saved LinkedIn draft',
      blog: '',
    },
    brief: {
      brandId: 'brand-1',
      brandName: 'BHV Marais',
      language: 'French',
    },
    draftMeta: {
      id: 'draft-1',
      format: 'linkedin',
    },
  });
});
