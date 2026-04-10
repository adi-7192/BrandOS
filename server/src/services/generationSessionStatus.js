const GENERATION_SESSION_STATUSES = new Set(['in_progress', 'saved', 'completed', 'abandoned']);
const GENERATION_SESSION_STEPS = new Set(['brief', 'preview', 'creating', 'output']);

export function hasMeaningfulSessionOutput(outputPayload = {}) {
  return ['linkedin', 'blog'].some((key) => String(outputPayload?.[key] || '').trim().length > 0);
}

export function validateGenerationSessionPayload(
  {
    status = 'in_progress',
    currentStep = 'brief',
    outputPayload = {},
  } = {},
  {
    mode = 'update',
    allowAbandoned = false,
  } = {}
) {
  if (!GENERATION_SESSION_STATUSES.has(status)) {
    return 'Invalid campaign status.';
  }

  if (!GENERATION_SESSION_STEPS.has(currentStep)) {
    return 'Invalid campaign step.';
  }

  if (mode === 'create' && status !== 'in_progress') {
    return 'New campaigns must start in progress.';
  }

  if (status === 'abandoned' && !allowAbandoned) {
    return 'Use the delete flow to abandon a campaign.';
  }

  if (status === 'saved') {
    if (currentStep !== 'output') {
      return 'Saved draft campaigns must remain on the output step.';
    }

    if (!hasMeaningfulSessionOutput(outputPayload)) {
      return 'Campaigns can only be saved as draft after output has been generated.';
    }
  }

  if (status === 'completed') {
    if (currentStep !== 'output') {
      return 'Completed campaigns must remain on the output step.';
    }

    if (!hasMeaningfulSessionOutput(outputPayload)) {
      return 'Campaigns can only be marked as completed after output has been generated.';
    }
  }

  return null;
}
