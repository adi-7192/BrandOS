export function buildDashboardStats(summary) {
  const counts = summary?.counts || {};
  const brandCount = Number(counts.brands || 0);
  const pendingBriefCount = Number(counts.pendingBriefs || 0);
  const pipelineBrandCount = Number(counts.brandsInPipeline || 0);
  const savedDraftCount = Number(counts.recentDrafts || 0);

  return [
    {
      label: 'Brand Kits',
      value: brandCount,
      note: brandCount === 1 ? '1 live brand' : `${brandCount} live brands`,
      tone: 'neutral',
      icon: 'layers',
    },
    {
      label: 'Pending Briefs',
      value: pendingBriefCount,
      note: pendingBriefCount > 0 ? `${pendingBriefCount} ready to review` : 'Queue is clear',
      tone: pendingBriefCount > 0 ? 'blue' : 'neutral',
      icon: 'inbox',
    },
    {
      label: 'Brands in Pipeline',
      value: pipelineBrandCount,
      note: pipelineBrandCount > 0
        ? `${pipelineBrandCount} brand${pipelineBrandCount === 1 ? '' : 's'} with active work`
        : 'No active pipeline yet',
      tone: pipelineBrandCount > 0 ? 'green' : 'neutral',
      icon: 'draft',
    },
    {
      label: 'Saved Drafts',
      value: savedDraftCount,
      note: savedDraftCount > 0 ? 'Recent outputs ready to reopen' : 'No drafts saved yet',
      tone: savedDraftCount > 0 ? 'amber' : 'neutral',
      icon: 'bookmark',
    },
  ];
}

export function buildUpcomingDeadlineItems(summary, now = new Date()) {
  return [...(summary?.upcomingDeadlines || [])]
    .filter((item) => item.publishDate)
    .sort((a, b) => getTimestamp(a.publishDate) - getTimestamp(b.publishDate))
    .slice(0, 6)
    .map((item) => {
      const { urgencyLabel, urgencyTone } = getDeadlineUrgency(item.publishDate, now);
      return {
        ...item,
        urgencyLabel,
        urgencyTone,
      };
    });
}

export function buildBriefActionItems(summary) {
  return [...(summary?.pendingBriefs || [])]
    .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))
    .slice(0, 3)
    .map((brief) => {
      const matchedFieldCount = (brief.matchedFields || []).length;
      return {
        id: brief.id,
        kind: 'brief',
        title: brief.emailSubject || 'Untitled brief',
        brandName: brief.brandName || 'Unknown brand',
        meta: `${matchedFieldCount} field${matchedFieldCount === 1 ? '' : 's'} found`,
        qualityLabel: getBriefQualityLabel(matchedFieldCount),
        qualityTone: matchedFieldCount >= 3 ? 'green' : 'amber',
        createdAt: brief.createdAt,
        actionLabel: 'Open brief',
      };
    });
}

export function buildContinueWorkingItems(summary) {
  const sessionItems = (summary?.recentSessions || []).map((session) => ({
    id: session.id,
    kind: 'session',
    title: session.sessionTitle || session.brandName || 'Untitled session',
    brandName: session.brandName || 'Unknown brand',
    itemType: 'Live session',
    updatedAt: session.updatedAt,
    actionLabel: 'Resume session',
  }));

  const draftItems = (summary?.recentDrafts || []).map((draft) => ({
    id: draft.id,
    kind: 'draft',
    title: `${formatContentType(draft.format)} draft`,
    brandName: draft.brandName || 'Unknown brand',
    itemType: 'Saved draft',
    updatedAt: draft.createdAt,
    actionLabel: 'Open draft',
  }));

  return [...sessionItems, ...draftItems]
    .sort((a, b) => {
      const diff = getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
      if (diff !== 0) {
        return diff;
      }

      return a.kind === b.kind ? 0 : a.kind === 'session' ? -1 : 1;
    })
    .slice(0, 3);
}

export function buildBrandPortfolioRows(summary) {
  return [...(summary?.brands || [])]
    .sort((a, b) => {
      const pendingDiff = Number(b.pendingBriefCount || 0) - Number(a.pendingBriefCount || 0);
      if (pendingDiff !== 0) {
        return pendingDiff;
      }

      return getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
    })
    .map((brand) => {
      const toneSummary = (brand.voiceAdjectives || []).slice(0, 2).join(', ') || 'Voice still being defined';
      const isActive = (brand.voiceAdjectives || []).length > 0;
      const pendingBriefCount = Number(brand.pendingBriefCount || 0);

      return {
        id: brand.id,
        name: brand.name || 'Untitled brand',
        descriptor: [brand.market, brand.language].filter(Boolean).join(' · ') || 'Market profile pending',
        toneSummary,
        statusLabel: isActive ? 'Active' : 'Draft',
        statusTone: isActive ? 'green' : 'amber',
        pendingBriefLabel: pendingBriefCount > 0 ? `${pendingBriefCount} pending brief${pendingBriefCount === 1 ? '' : 's'}` : 'Queue clear',
        guidelineLabel: brand.hasGuidelineDocument ? 'Guideline loaded' : 'No guideline loaded',
        guidelineTone: brand.hasGuidelineDocument ? 'blue' : 'neutral',
        pendingBriefCount,
        href: `/settings/brands/${brand.id}`,
        actionLabel: 'Open kit',
      };
    });
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
    .sort((a, b) => getTimestamp(b.when) - getTimestamp(a.when))
    .slice(0, 5);
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

function formatContentType(format) {
  return format === 'linkedin' ? 'LinkedIn' : 'Blog';
}

function getTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getBriefQualityLabel(matchedFieldCount) {
  return matchedFieldCount >= 3 ? 'High match' : 'Needs review';
}

function getDeadlineUrgency(publishDate, now) {
  const date = new Date(`${publishDate}T00:00:00.000Z`);
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      urgencyLabel: `Overdue by ${Math.abs(diffDays)}d`,
      urgencyTone: 'red',
    };
  }

  if (diffDays === 0) {
    return { urgencyLabel: 'Due today', urgencyTone: 'red' };
  }

  if (diffDays === 1) {
    return { urgencyLabel: 'Due tomorrow', urgencyTone: 'amber' };
  }

  if (diffDays <= 3) {
    return { urgencyLabel: `Due in ${diffDays} days`, urgencyTone: 'amber' };
  }

  if (diffDays <= 7) {
    return { urgencyLabel: `Due in ${diffDays} days`, urgencyTone: 'blue' };
  }

  return {
    urgencyLabel: `Due ${formatCalendarDate(date)}`,
    urgencyTone: 'neutral',
  };
}

function formatCalendarDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(value);
}
