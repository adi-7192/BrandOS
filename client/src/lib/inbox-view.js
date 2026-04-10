export function buildInboxCounts(cards) {
  return {
    pending: cards.filter((card) => card.status === 'pending').length,
    used: cards.filter((card) => card.status === 'used').length,
    dismissed: cards.filter((card) => card.status === 'dismissed').length,
  };
}

export function buildInboxEmptyState({ activeTab, intakeEmail, gmailAvailable }) {
  if (activeTab !== 'pending') {
    return {
      title: activeTab === 'used' ? 'No completed updates here yet' : 'No dismissed updates here yet',
      description: 'When threads move through BrandOS, they will show up here so you can keep track of what has already been handled.',
      steps: [],
      actions: [],
    };
  }

  return {
    title: 'No stakeholder updates yet',
    description: 'Forward a campaign or stakeholder thread into BrandOS and AI will turn it into a review-ready brief with suggested next actions.',
    steps: [
      `Forward a stakeholder email to ${intakeEmail || 'your BrandOS intake address'}.`,
      'BrandOS extracts the campaign brief and any brand-kit updates.',
      'Review the brief, generate content, and publish when you are ready.',
    ],
    actions: [
      { id: 'sample-flow', label: 'Explore a sample workflow' },
      { id: 'open-settings', label: gmailAvailable ? 'View inbox setup' : 'Set up inbox forwarding' },
    ],
  };
}

export function groupInboxThreads(cards) {
  const grouped = new Map();

  for (const card of cards) {
    const key = card.threadId || card.id;
    const entry = grouped.get(key) || {
      id: key,
      subject: card.emailSubject,
      brandName: card.brandName,
      sourceLabel: card.emailFrom,
      createdAt: card.createdAt,
      updateCount: 0,
      statuses: [],
      cards: [],
    };

    entry.cards.push(card);
    entry.updateCount += 1;
    entry.createdAt = newerDate(entry.createdAt, card.createdAt);
    if (!entry.statuses.includes(card.status)) {
      entry.statuses.push(card.status);
    }
    grouped.set(key, entry);
  }

  return [...grouped.values()]
    .map((thread) => ({
      ...thread,
      cards: thread.cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      statuses: thread.statuses.sort(),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function pickThreadSource(cards, selectedCardId) {
  const selected = cards.find((card) => card.id === selectedCardId);
  if (!selected) {
    return null;
  }

  const threadId = selected.threadId || selected.id;
  const threadCards = cards
    .filter((card) => (card.threadId || card.id) === threadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const source = threadCards[0];

  return {
    threadId,
    subject: source.emailSubject,
    sourceLabel: source.emailFrom,
    emailBody: source.emailBody || source.excerpt || '',
    createdAt: source.createdAt,
    cards: threadCards,
  };
}

function newerDate(left, right) {
  return new Date(right).getTime() > new Date(left).getTime() ? right : left;
}
