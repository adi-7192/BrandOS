import { normalizeKitCards } from './kit-review.js';

export function buildConfidenceSamplePayload(state) {
  return {
    brandName: state.brandName,
    kitCards: normalizeKitCards(state.kitCards || {}),
    campaignType: state.campaignType,
    funnelStage: state.funnelStage,
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
  if (regenerating || regenerateCount >= 1) return false;
  return selectedChips.length > 0 || String(freeText || '').trim().length > 0;
}
