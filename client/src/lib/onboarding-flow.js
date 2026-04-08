import { normalizeKitCards } from './kit-review.js';

export function buildOnboardingSavePayload(state) {
  return {
    role: state.role,
    team: state.team,
    brandCount: state.brandCount,
    brandName: state.brandName,
    primaryMarket: state.primaryMarket,
    brandLanguage: state.brandLanguage,
    websiteUrl: state.websiteUrl,
    pastContentExamples: state.pastContentExamples,
    audienceType: state.audienceType,
    buyerSeniority: state.buyerSeniority,
    ageRange: state.ageRange,
    industrySector: state.industrySector,
    industryTarget: state.industryTarget,
    funnelStage: state.funnelStage,
    toneShift: state.toneShift,
    proofStyle: state.proofStyle,
    contentRole: state.contentRole,
    contentGoal: state.contentGoal,
    publishingFrequency: state.publishingFrequency,
    voiceFormality: state.voiceFormality,
    campaignCoreWhy: state.campaignCoreWhy,
    kitCards: normalizeKitCards(state.kitCards || {}),
  };
}

export function shouldClearAuthOnError(err) {
  const status = err?.response?.status;
  const message = err?.response?.data?.message;
  const url = err?.config?.url || '';

  if (url.includes('/auth/me')) return true;
  if (status !== 401) return false;

  return message === 'Token invalid or expired.' || message === 'Unauthorised.';
}
