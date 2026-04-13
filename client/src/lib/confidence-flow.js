import { normalizeKitCards } from './kit-review.js';
import { normalizeFunnelStages } from './brand-kit-fields.js';

export function buildConfidenceSamplePayload(state) {
  return {
    brandName: state.brandName,
    kitCards: normalizeKitCards(state.kitCards || {}),
    campaignType: state.campaignType,
    funnelStages: normalizeFunnelStages(state.funnelStages || state.funnelStage),
    toneShift: state.toneShift,
    brandLanguage: state.brandLanguage,
  };
}

export function buildConfidenceRegenerationPayload(state, { currentSample, selectedChips, freeText }) {
  return {
    ...buildConfidenceSamplePayload(state),
    currentSample,
    feedbackChips: selectedChips,
    feedbackNotes: String(freeText || '').trim(),
  };
}

export function canRegenerateConfidenceSample({ selectedChips, freeText, regenerateCount, regenerating }) {
  if (regenerating) return false;
  return selectedChips.length > 0 || String(freeText || '').trim().length > 0;
}

export function hasMeaningfulConfidenceEdit(originalSample, currentSample) {
  return String(originalSample || '').trim() !== String(currentSample || '').trim();
}

export function buildConfidenceApprovalResult({
  reaction,
  regenerateCount,
  originalSample,
  currentSample,
  approvedAt = new Date().toISOString(),
}) {
  return {
    reaction,
    regenerateCount,
    edited: hasMeaningfulConfidenceEdit(originalSample, currentSample),
    approvedAt,
  };
}

export function canApproveConfidenceReaction({
  reaction,
  regenerateCount,
  originalSample,
  currentSample,
}) {
  if (reaction === 'positive') return true;
  if (reaction !== 'mixed') return false;

  return regenerateCount > 0 || hasMeaningfulConfidenceEdit(originalSample, currentSample);
}
