import { normalizeKitCards } from './kit-review.js';
import {
  formatAgeRanges,
  normalizeFunnelStages,
  resolveProofStyle,
  resolveAudienceType,
  resolveIndustryTarget,
  resolveToneShift,
  resolveContentGoal,
  resolveCtaStyle,
} from './brand-kit-fields.js';

export function buildOnboardingSavePayload(state) {
  return {
    role: state.role,
    team: state.team,
    brandCount: state.brandCount,
    brandName: state.brandName,
    primaryMarket: state.primaryMarket,
    brandLanguage: state.brandLanguage,
    websiteUrl: state.websiteUrl,
    websiteUrls: state.websiteUrls,
    websiteSummary: state.websiteSummary,
    pastContentExamples: state.pastContentExamples,
    guidelineFileUrl: state.guidelineFileUrl,
    guidelineFileName: state.guidelineFileName,
    guidelineStoragePath: state.guidelineStoragePath,
    guidelineTextExcerpt: state.guidelineTextExcerpt,
    audienceType: resolveAudienceType(state),
    buyerSeniority: state.buyerSeniority,
    ageRange: formatAgeRanges(state.ageRanges || state.ageRange),
    industrySector: state.industrySector,
    industryTarget: resolveIndustryTarget(state),
    audiencePainPoint: state.audiencePainPoint,
    funnelStages: normalizeFunnelStages(state.funnelStages || state.funnelStage),
    toneShift: resolveToneShift(state),
    proofStyle: resolveProofStyle(state),
    contentGoal: resolveContentGoal(state),
    ctaStyle: resolveCtaStyle(state),
    emojiUsage: state.emojiUsage,
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
