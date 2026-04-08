export function pickPrimaryTask(summary) {
  if ((summary?.pendingBriefs || []).length > 0) {
    return { kind: 'pending-brief', label: 'Review pending briefs' };
  }

  if ((summary?.recentDrafts || []).length > 0) {
    return { kind: 'recent-draft', label: 'Resume latest draft' };
  }

  return { kind: 'add-brand', label: 'Create your first brand' };
}

export function getDashboardStage(summary) {
  if ((summary?.pendingBriefs || []).length > 0) {
    return 'active';
  }

  if ((summary?.recentDrafts || []).length > 0 || (summary?.brands || []).length > 0) {
    return 'warming-up';
  }

  return 'setup';
}

export function buildFlowlineCards(summary) {
  const pendingBriefs = summary?.pendingBriefs || [];
  if (pendingBriefs.length > 0) {
    return pendingBriefs.slice(0, 4).map((brief) => ({
      id: brief.id,
      kind: 'brief',
      title: brief.emailSubject,
      eyebrow: brief.brandName,
      description: brief.excerpt || 'Brief ready for confirmation.',
      meta: `${(brief.matchedFields || []).length} field${(brief.matchedFields || []).length === 1 ? '' : 's'} found`,
      ctaLabel: 'Open brief',
    }));
  }

  const recentDrafts = summary?.recentDrafts || [];
  if (recentDrafts.length > 0) {
    return recentDrafts.slice(0, 3).map((draft) => ({
      id: draft.id,
      kind: 'draft',
      title: `Resume ${draft.format === 'linkedin' ? 'LinkedIn' : 'Blog'} draft`,
      eyebrow: draft.brandName,
      description: draft.content || 'Saved draft ready to resume.',
      meta: `Version ${draft.versionNumber}`,
      ctaLabel: 'Resume draft',
    }));
  }

  return [
    {
      id: 'setup-brand',
      kind: 'setup',
      title: 'Create your first brand',
      eyebrow: 'Setup',
      description: 'Capture voice, audience, and channel rules before you generate.',
      meta: '5 minute setup',
      ctaLabel: 'Start setup',
    },
  ];
}

export function buildRecentActivity(summary) {
  const sessionItems = (summary?.recentSessions || []).map((session) => ({
    id: `session-${session.id}`,
    kind: 'session',
    title: 'Work resumed',
    subject: session.sessionTitle || session.brandName || 'Untitled session',
    when: session.updatedAt,
    href: `/generate/brief?sessionId=${session.id}`,
  }));

  const briefItems = (summary?.pendingBriefs || []).map((brief) => ({
    id: `brief-${brief.id}`,
    kind: 'brief',
    title: 'New brief received',
    subject: brief.emailSubject,
    when: brief.createdAt,
    href: '/generate/brief',
  }));

  const draftItems = (summary?.recentDrafts || []).map((draft) => ({
    id: `draft-${draft.id}`,
    kind: 'draft',
    title: 'Draft saved',
    subject: `${draft.brandName} ${draft.format} draft`,
    when: draft.createdAt,
    href: '/generate/output',
  }));

  const brandItems = (summary?.brands || []).map((brand) => ({
    id: `brand-${brand.id}`,
    kind: 'brand',
    title: 'Brand kit updated',
    subject: brand.name,
    when: brand.updatedAt,
    href: `/settings/brands/${brand.id}`,
  }));

  return [...sessionItems, ...briefItems, ...draftItems, ...brandItems]
    .filter((item) => item.when)
    .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
    .slice(0, 6);
}

export function buildAttentionItems(summary) {
  const items = [];

  for (const brief of summary?.pendingBriefs || []) {
    items.push({
      id: brief.id,
      kind: 'brief',
      title: brief.emailSubject,
      subtitle: brief.brandName,
      status: 'brief',
      actionLabel: 'Use brief',
    });
  }

  for (const session of summary?.recentSessions || []) {
    items.push({
      id: session.id,
      kind: 'session',
      title: `Resume ${session.sessionTitle || session.brandName || 'session'}`,
      subtitle: session.brandName || 'In progress',
      status: 'session',
      actionLabel: 'Resume session',
    });
  }

  for (const draft of summary?.recentDrafts || []) {
    items.push({
      id: draft.id,
      kind: 'draft',
      title: `Review ${draft.format === 'linkedin' ? 'LinkedIn' : 'Blog'} draft`,
      subtitle: draft.brandName,
      status: 'draft',
      actionLabel: 'Open draft',
    });
  }

  if (items.length === 0 || !summary?.setup?.hasBrands) {
    items.push({
      id: 'setup-brand',
      kind: 'setup',
      title: 'Create your first brand kit',
      subtitle: 'Brand memory starts here',
      status: 'setup',
      actionLabel: 'Start setup',
    });
  }

  if (items.length < 3 && !summary?.setup?.gmailAvailable) {
    items.push({
      id: 'setup-gmail',
      kind: 'settings',
      title: 'Finish Gmail configuration',
      subtitle: 'Enable tagged briefs to land in the inbox',
      status: 'setup',
      actionLabel: 'Open settings',
    });
  }

  return items.slice(0, 4);
}

export function buildDraftOutputState(draft) {
  return {
    activeTab: draft.format,
    output: {
      linkedin: draft.format === 'linkedin' ? draft.content : '',
      blog: draft.format === 'blog' ? draft.content : '',
    },
    brief: {
      brandId: draft.brandId,
      brandName: draft.brandName,
      language: draft.language,
    },
    draftMeta: {
      id: draft.id,
      format: draft.format,
    },
  };
}
