export function buildGenerationSessionPayload({
  brief,
  sections = {},
  output = {},
  currentStep,
  activeTab = 'linkedin',
  lastInstruction = '',
  status = 'in_progress',
}) {
  const source = brief?.mode === 'manual' ? 'manual' : 'inbox';

  return {
    brandId: brief?.brandId || '',
    sessionTitle: brief?.campaignName || brief?.emailSubject || brief?.brandName || 'Untitled session',
    source,
    sourceCardIds: brief?.sourceCardIds || [],
    currentStep,
    status,
    activeTab,
    lastInstruction,
    briefPayload: brief || {},
    previewPayload: sections,
    outputPayload: output,
  };
}

export function buildResumeSessionItem(session) {
  return {
    id: session.id,
    title: session.sessionTitle || session.brandName || 'Untitled session',
    subtitle: `${session.source === 'manual' ? 'Manual brief' : 'Inbox brief'} · ${formatStepLabel(session.currentStep)}`,
    updatedAt: session.updatedAt,
  };
}

export function buildSessionQuery(sessionId) {
  return sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
}

export function buildSessionRoute(session) {
  const step = session?.currentStep || 'brief';
  const path = step === 'preview'
    ? '/generate/preview'
    : step === 'creating'
      ? '/generate/creating'
      : step === 'output'
        ? '/generate/output'
        : '/generate/brief';

  return `${path}${buildSessionQuery(session?.id)}`;
}

function formatStepLabel(step) {
  const labels = {
    brief: 'Brief',
    preview: 'Preview',
    creating: 'Generating',
    output: 'Output',
  };

  return labels[step] || 'In progress';
}
