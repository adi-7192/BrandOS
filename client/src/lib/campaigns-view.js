const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'completed', label: 'Completed' },
];

export function buildCampaignFilters(campaigns = []) {
  return FILTERS.map((filter) => ({
    ...filter,
    count: filter.id === 'all'
      ? campaigns.length
      : campaigns.filter((campaign) => campaign.status === filter.id).length,
  }));
}

export function filterCampaigns(campaigns = [], { activeFilter = 'all', searchQuery = '' } = {}) {
  const normalizedQuery = String(searchQuery || '').trim().toLowerCase();

  return campaigns.filter((campaign) => {
    const matchesFilter = activeFilter === 'all' || campaign.status === activeFilter;
    if (!matchesFilter) return false;

    if (!normalizedQuery) return true;

    const haystack = [
      campaign.campaignName,
      campaign.brandName,
      campaign.campaignType,
      campaign.toneShift,
      campaign.keyMessage,
      ...(campaign.channels || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function buildCampaignCards(campaigns = []) {
  return campaigns.map((campaign) => {
    const outputs = buildOutputPills(campaign.outputs);

    return {
      id: campaign.id,
      title: campaign.campaignName || 'Untitled campaign',
      brandName: campaign.brandName || 'Unknown brand',
      statusLabel: campaign.statusLabel || 'Draft',
      statusTone: getStatusTone(campaign.status),
      typeLabel: campaign.campaignType || 'Unspecified',
      publishLabel: formatPublishDate(campaign.publishDate),
      stepLabel: campaign.currentStepLabel || 'Campaign in progress',
      toneLabel: campaign.toneShift || 'Baseline brand tone',
      keyMessage: campaign.keyMessage || 'Campaign brief still being finalized.',
      channelsLabel: buildChannelsLabel(campaign.channels),
      progressPercent: campaign.progressPercent || 0,
      outputs,
      primaryAction: buildPrimaryAction(campaign),
      secondaryAction: {
        label: 'View brand',
        href: campaign.brandHref,
      },
      updatedLabel: `Updated ${formatUpdatedDate(campaign.updatedAt)}`,
    };
  });
}

function buildOutputPills(outputs = {}) {
  return [
    buildOutputPill('linkedin', 'LinkedIn', outputs.linkedin),
    buildOutputPill('blog', 'Blog', outputs.blog),
  ].filter(Boolean);
}

function buildOutputPill(id, label, state) {
  if (!state || state === 'empty') return null;

  return {
    id,
    label,
    stateLabel: state === 'ready' ? 'Ready' : 'Draft',
    stateTone: state === 'ready' ? 'green' : 'amber',
  };
}

function buildPrimaryAction(campaign) {
  const shouldOpenOutput = campaign.currentStep === 'output'
    || campaign.status === 'completed'
    || String(campaign.resumeHref || '').includes('/generate/output');

  return {
    label: shouldOpenOutput ? 'Open output' : 'Resume',
    href: campaign.resumeHref,
  };
}

function buildChannelsLabel(channels = []) {
  return channels.length > 0 ? channels.join(', ') : 'Channels still being scoped';
}

function getStatusTone(status) {
  if (status === 'completed') return 'blue';
  if (status === 'active') return 'green';
  return 'amber';
}

function formatPublishDate(value) {
  if (!value) return 'Publish date pending';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Publish date pending';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatUpdatedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
