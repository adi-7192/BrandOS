import {
  normalizeFunnelStages,
  resolveProofStyle,
  resolveAudienceType,
  resolveIndustryTarget,
  resolveCampaignType,
  resolveToneShift,
  resolveContentGoal,
  resolveCtaStyle,
} from './brand-kit-fields.js';

export function buildExtractKitRequest(state) {
  const websiteUrls = [...new Set(
    [state.websiteUrl, ...(state.websiteUrls || [])]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )];
  const payload = {
    brandName: state.brandName,
    websiteUrl: state.websiteUrl,
    websiteUrls,
    pastContentExamples: state.pastContentExamples,
    audienceType: resolveAudienceType(state),
    buyerSeniority: state.buyerSeniority,
    ageRange: state.ageRange,
    industrySector: state.industrySector,
    industryTarget: resolveIndustryTarget(state),
    audiencePainPoint: state.audiencePainPoint,
    campaignType: resolveCampaignType(state),
    funnelStages: normalizeFunnelStages(state.funnelStages || state.funnelStage),
    toneShift: resolveToneShift(state),
    proofStyle: resolveProofStyle(state),
    contentGoal: resolveContentGoal(state),
    ctaStyle: resolveCtaStyle(state),
    emojiUsage: state.emojiUsage,
    publishingFrequency: state.publishingFrequency,
    voiceFormality: state.voiceFormality,
    brandLanguage: state.brandLanguage,
    primaryMarket: state.primaryMarket,
  };

  if (!state.brandGuidelinesFile) {
    return { data: payload, config: undefined, isMultipart: false };
  }

  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
    }
  });
  formData.append('brandGuidelinesFile', state.brandGuidelinesFile);

  return {
    data: formData,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    isMultipart: true,
  };
}
