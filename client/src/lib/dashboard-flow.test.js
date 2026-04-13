import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyUpdatedBrandToCollection,
  buildBrandKitEditorState,
  buildBrandKitUpdatePayload,
  buildBrandPortfolioRows,
  buildBriefActionItems,
  buildContinueWorkingItems,
  buildDashboardStats,
  buildDraftOutputState,
  buildRecentActivity,
  buildUpcomingDeadlineItems,
  buildWorkflowGuide,
  normalizeDashboardSummary,
} from './dashboard-flow.js';

test('normalizeDashboardSummary fills missing nested dashboard data so the page does not crash on partial API responses', () => {
  assert.deepEqual(
    normalizeDashboardSummary({
      counts: {
        brands: 3,
      },
      brands: null,
      pendingBriefs: undefined,
    }),
    {
      counts: {
        brands: 3,
        pendingBriefs: 0,
        recentDrafts: 0,
        inProgressSessions: 0,
        brandsInPipeline: 0,
      },
      pendingBriefs: [],
      recentSessions: [],
      recentDrafts: [],
      brands: [],
      upcomingDeadlines: [],
      setup: {
        hasBrands: false,
        hasPendingBriefs: false,
        hasRecentSessions: false,
        hasRecentDrafts: false,
        gmailAvailable: false,
      },
    }
  );
});

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
        hasGuidelineDocument: true,
        pendingBriefCount: 2,
        updatedAt: '2026-04-06T10:00:00.000Z',
      },
      {
        id: 'brand-2',
        name: 'Northstar',
        market: 'Germany',
        language: 'German',
        voiceAdjectives: [],
        hasGuidelineDocument: false,
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
      guidelineLabel: 'Guideline loaded',
      guidelineTone: 'blue',
      pendingBriefCount: 2,
      href: '/settings/brands/brand-1',
      primaryActionLabel: 'Edit brand kit',
      secondaryActionLabel: 'Open full kit',
    },
    {
      id: 'brand-2',
      name: 'Northstar',
      descriptor: 'Germany · German',
      toneSummary: 'Voice still being defined',
      statusLabel: 'Draft',
      statusTone: 'amber',
      pendingBriefLabel: 'Queue clear',
      guidelineLabel: 'No guideline loaded',
      guidelineTone: 'neutral',
      pendingBriefCount: 0,
      href: '/settings/brands/brand-2',
      primaryActionLabel: 'Edit brand kit',
      secondaryActionLabel: 'Open full kit',
    },
  ]);
});

test('buildBrandKitEditorState prepares editable dashboard form fields from a full brand payload', () => {
  const state = buildBrandKitEditorState({
    id: 'brand-1',
    name: 'Atlas',
    kit: {
      voiceAdjectives: ['Warm', 'Direct'],
      vocabulary: ['Craft', 'Neighbourhood'],
      restrictedWords: ['cheap', 'disruptive'],
      channelRulesLinkedin: 'Lead with a point of view.',
      channelRulesBlog: 'Use subheadings.',
      contentGoal: 'Thought leadership',
      publishingFrequency: 'Weekly',
      audienceType: 'CMOs',
      buyerSeniority: 'Director',
      ageRange: '30-45',
      industrySector: 'Retail',
      industryTarget: 'Luxury retail',
      funnelStages: ['Top of funnel', 'Mid funnel'],
      toneShift: 'More premium',
      proofStyle: 'Customer story',
      voiceFormality: 3,
      campaignCoreWhy: 'Build preference over time.',
      pastContentExamples: 'Founder note and launch post.',
      websiteUrl: 'https://atlas.example',
      websiteUrls: ['https://atlas.example/about', 'https://atlas.example/journal'],
      websiteSummary: 'Atlas designs modern retail experiences.',
    },
  });

  assert.deepEqual(state, {
    voiceAdjectives: 'Warm, Direct',
    vocabulary: 'Craft, Neighbourhood',
    restrictedWords: 'cheap, disruptive',
    channelRulesLinkedin: 'Lead with a point of view.',
    channelRulesBlog: 'Use subheadings.',
    contentGoal: 'Thought leadership',
    publishingFrequency: 'Weekly',
    audienceType: 'CMOs',
    buyerSeniority: 'Director',
    ageRange: '30-45',
    industrySector: 'Retail',
    industryTarget: 'Luxury retail',
    funnelStages: 'Top of funnel, Mid funnel',
    toneShift: 'More premium',
    proofStyle: 'Customer story',
    voiceFormality: '3',
    campaignCoreWhy: 'Build preference over time.',
    pastContentExamples: 'Founder note and launch post.',
    websiteUrl: 'https://atlas.example',
    websiteUrls: 'https://atlas.example/about, https://atlas.example/journal',
    websiteSummary: 'Atlas designs modern retail experiences.',
  });
});

test('buildBrandKitUpdatePayload trims text fields and converts list inputs into arrays', () => {
  const payload = buildBrandKitUpdatePayload({
    voiceAdjectives: ' Warm, Direct , Warm ',
    vocabulary: 'Craft, Neighbourhood',
    restrictedWords: ' cheap, disruptive ',
    channelRulesLinkedin: ' Lead with a point of view. ',
    channelRulesBlog: '',
    contentGoal: ' Thought leadership ',
    publishingFrequency: ' Weekly ',
    audienceType: ' CMOs ',
    buyerSeniority: ' Director ',
    ageRange: ' 30-45 ',
    industrySector: ' Retail ',
    industryTarget: ' Luxury retail ',
    funnelStages: ' Top of funnel , Mid funnel ',
    toneShift: ' More premium ',
    proofStyle: ' Customer story ',
    voiceFormality: ' 4 ',
    campaignCoreWhy: ' Build preference over time. ',
    pastContentExamples: ' Founder note and launch post. ',
    websiteUrl: ' https://atlas.example ',
    websiteUrls: ' https://atlas.example/about, https://atlas.example/journal ',
    websiteSummary: ' Atlas designs modern retail experiences. ',
  });

  assert.deepEqual(payload, {
    confirmed: true,
    kit: {
      voiceAdjectives: ['Warm', 'Direct'],
      vocabulary: ['Craft', 'Neighbourhood'],
      restrictedWords: ['cheap', 'disruptive'],
      channelRulesLinkedin: 'Lead with a point of view.',
      channelRulesBlog: '',
      contentGoal: 'Thought leadership',
      publishingFrequency: 'Weekly',
      audienceType: 'CMOs',
      buyerSeniority: 'Director',
      ageRange: '30-45',
      industrySector: 'Retail',
      industryTarget: 'Luxury retail',
      funnelStages: ['Top of funnel', 'Mid funnel'],
      toneShift: 'More premium',
      proofStyle: 'Customer story',
      voiceFormality: 4,
      campaignCoreWhy: 'Build preference over time.',
      pastContentExamples: 'Founder note and launch post.',
      websiteUrl: 'https://atlas.example',
      websiteUrls: ['https://atlas.example/about', 'https://atlas.example/journal'],
      websiteSummary: 'Atlas designs modern retail experiences.',
    },
  });
});

test('applyUpdatedBrandToCollection replaces the saved brand so dashboard summaries refresh immediately', () => {
  const brands = applyUpdatedBrandToCollection([
    { id: 'brand-1', name: 'Atlas', kit: { voiceAdjectives: ['Warm'] } },
    { id: 'brand-2', name: 'Northstar', kit: { voiceAdjectives: [] } },
  ], {
    id: 'brand-1',
    name: 'Atlas',
    kit: { voiceAdjectives: ['Warm', 'Direct'] },
  });

  assert.deepEqual(brands, [
    { id: 'brand-1', name: 'Atlas', kit: { voiceAdjectives: ['Warm', 'Direct'] } },
    { id: 'brand-2', name: 'Northstar', kit: { voiceAdjectives: [] } },
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

test('buildUpcomingDeadlineItems ignores malformed publish dates instead of crashing the overview page', () => {
  const items = buildUpcomingDeadlineItems({
    upcomingDeadlines: [
      {
        id: 'bad-date',
        kind: 'brief',
        title: 'Broken deadline',
        brandName: 'Atlas',
        publishDate: 'not-a-date',
        stateLabel: 'Pending brief',
      },
      {
        id: 'good-date',
        kind: 'session',
        title: 'Valid deadline',
        brandName: 'Northstar',
        publishDate: '2026-04-12',
        stateLabel: 'In progress',
      },
    ],
  }, new Date('2026-04-09T09:00:00.000Z'));

  assert.deepEqual(items, [
    {
      id: 'good-date',
      kind: 'session',
      title: 'Valid deadline',
      brandName: 'Northstar',
      publishDate: '2026-04-12',
      stateLabel: 'In progress',
      urgencyLabel: 'Due in 3 days',
      urgencyTone: 'amber',
    },
  ]);
});

test('buildWorkflowGuide exposes a first-run explainer and sample CTA when the workspace has little activity', () => {
  const guide = buildWorkflowGuide({
    counts: {
      brands: 1,
      pendingBriefs: 0,
      recentDrafts: 0,
      inProgressSessions: 0,
    },
    setup: {
      gmailAvailable: false,
      hasPendingBriefs: false,
      hasRecentSessions: false,
      hasRecentDrafts: false,
    },
  });

  assert.deepEqual(guide, {
    visible: true,
    title: 'How BrandOS turns updates into content',
    description: 'BrandOS works best when it can pull campaign context into a brief, then generate on-brand drafts you can review and publish.',
    steps: [
      {
        title: 'Bring in a stakeholder update',
        description: 'Forward a thread to BrandOS or start from a sample workflow if your inbox is not ready yet.',
      },
      {
        title: 'Confirm the campaign brief',
        description: 'BrandOS extracts the campaign details and lets you tighten the brief before anything is written.',
      },
      {
        title: 'Generate and publish on-brand content',
        description: 'Preview LinkedIn and blog drafts, edit if needed, then publish or copy the final version.',
      },
    ],
    actions: [
      { id: 'sample-flow', label: 'Explore a sample workflow' },
      { id: 'open-inbox', label: 'Set up your inbox' },
    ],
  });
});
