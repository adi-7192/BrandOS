import { mapGenerationSessionRow } from './generationSessions.js';

export function mapCampaignRows(rows = []) {
  return rows
    .map(mapGenerationSessionRow)
    .filter((session) => session.status !== 'abandoned')
    .map((session) => {
      const brief = session.briefPayload || {};
      const outputs = getOutputStates(session.outputPayload || {});
      const channels = getChannels(outputs);
      const status = getCampaignStatus(session, outputs);

      return {
        id: session.id,
        brandId: session.brandId,
        brandName: session.brandName || 'Unknown brand',
        language: session.language || 'English',
        campaignName: brief.campaignName || session.sessionTitle || session.brandName || 'Untitled campaign',
        campaignType: brief.campaignType || 'Unspecified',
        toneShift: brief.toneShift || 'Baseline brand tone',
        keyMessage: brief.keyMessage || 'Campaign brief still being finalized.',
        status,
        statusLabel: getStatusLabel(status),
        currentStep: session.currentStep || 'brief',
        currentStepLabel: getStepLabel(session.currentStep),
        publishDate: session.publishDate || '',
        source: session.source || 'manual',
        sourceLabel: session.source === 'inbox' ? 'Inbox brief' : 'Manual campaign',
        sourceCardIds: session.sourceCardIds || [],
        channels,
        progressPercent: getProgressPercent(status, session.currentStep),
        outputs,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        resumeHref: getResumeHref(session),
        brandHref: `/settings/brands/${session.brandId}`,
      };
    })
    .sort((left, right) => getTimestamp(right.updatedAt) - getTimestamp(left.updatedAt));
}

function getCampaignStatus(session, outputs) {
  if (session.status === 'completed') {
    return 'completed';
  }

  if (session.status === 'saved') {
    return 'draft';
  }

  if (session.currentStep === 'creating' || session.currentStep === 'output') {
    return 'active';
  }

  if (outputs.linkedin === 'ready' || outputs.blog === 'ready') {
    return 'active';
  }

  return 'draft';
}

function getOutputStates(outputPayload) {
  return {
    linkedin: String(outputPayload.linkedin || '').trim() ? 'ready' : 'empty',
    blog: String(outputPayload.blog || '').trim() ? 'ready' : 'empty',
  };
}

function getChannels(outputs) {
  const channels = [];
  if (outputs.linkedin === 'ready') channels.push('LinkedIn');
  if (outputs.blog === 'ready') channels.push('Blog');
  return channels;
}

function getStatusLabel(status) {
  if (status === 'completed') return 'Completed';
  if (status === 'active') return 'Active';
  return 'Draft';
}

function getStepLabel(step) {
  const labels = {
    brief: 'Brief in progress',
    preview: 'Preview in progress',
    creating: 'Generating content',
    output: 'Generated output',
  };

  return labels[step] || 'Campaign in progress';
}

function getProgressPercent(status, step) {
  if (status === 'completed') return 100;
  if (step === 'output') return 75;
  if (step === 'creating') return 60;
  if (step === 'preview') return 45;
  return 20;
}

function getResumeHref(session) {
  if (session.currentStep === 'output') {
    return `/generate/output?sessionId=${session.id}`;
  }

  if (session.currentStep === 'creating') {
    return `/generate/creating?sessionId=${session.id}`;
  }

  if (session.currentStep === 'preview') {
    return `/generate/preview?sessionId=${session.id}`;
  }

  return `/generate/brief?sessionId=${session.id}`;
}

function getTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
