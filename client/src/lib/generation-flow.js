export function buildConfirmedBrief(brief, overrides) {
  return {
    ...brief,
    campaignName: overrides.campaignName || brief.campaignName || '',
    campaignType: overrides.campaignType || brief.campaignType || '',
    keyMessage: overrides.keyMessage || brief.keyMessage || '',
    toneShift: overrides.toneShift || brief.toneShift || '',
    audienceType: overrides.audienceType || brief.audienceType || '',
    audience: overrides.audienceType || brief.audienceType || brief.audience || '',
    contentGoal: overrides.contentGoal || brief.contentGoal || '',
  };
}

export function buildGeneratingContext(brief) {
  return {
    voice: brief.kit?.voiceAdjectives?.join(', ') || 'Professional, clear, engaging',
    language: brief.language || 'English',
    toneShift: brief.toneShift || 'Baseline',
    audience: brief.audienceType || brief.audience || '—',
    guardrailCount: brief.kit?.restrictedWords?.length || 0,
    goal: brief.contentGoal || '—',
    keyMessage: brief.keyMessage || '—',
  };
}

export function buildManualBriefFromBrand(brand) {
  const kit = brand?.kit || {};

  return {
    mode: 'manual',
    brandId: brand?.id,
    brandName: brand?.name || '',
    language: brand?.language || 'English',
    campaignName: '',
    campaignType: '',
    audience: kit.audienceType || '',
    audienceType: kit.audienceType || '',
    toneShift: kit.toneShift || '',
    funnelStage: kit.funnelStage || '',
    contentGoal: kit.contentGoal || '',
    publishingFrequency: kit.publishingFrequency || '',
    proofStyle: kit.proofStyle || '',
    contentRole: kit.contentRole || '',
    voiceFormality: kit.voiceFormality ?? null,
    campaignCoreWhy: kit.campaignCoreWhy || '',
    keyMessage: '',
    lowConfidence: false,
    sourceCardIds: [],
    sourceThreadIds: [],
    voiceAdjectives: kit.voiceAdjectives || [],
    restrictedWords: kit.restrictedWords || [],
    kit: {
      voiceAdjectives: kit.voiceAdjectives || [],
      vocabulary: kit.vocabulary || [],
      restrictedWords: kit.restrictedWords || [],
      channelRules: {
        linkedin: kit.channelRulesLinkedin || '',
        blog: kit.channelRulesBlog || '',
      },
      audienceType: kit.audienceType || '',
      buyerSeniority: kit.buyerSeniority || '',
      ageRange: kit.ageRange || '',
      industrySector: kit.industrySector || '',
      industryTarget: kit.industryTarget || '',
      funnelStage: kit.funnelStage || '',
      toneShift: kit.toneShift || '',
      proofStyle: kit.proofStyle || '',
      contentRole: kit.contentRole || '',
      contentGoal: kit.contentGoal || '',
      publishingFrequency: kit.publishingFrequency || '',
      voiceFormality: kit.voiceFormality ?? null,
      campaignCoreWhy: kit.campaignCoreWhy || '',
      pastContentExamples: kit.pastContentExamples || '',
      websiteUrl: kit.websiteUrl || '',
      guidelineFileUrl: kit.guidelineFileUrl || '',
      guidelineFileName: kit.guidelineFileName || '',
      guidelineStoragePath: kit.guidelineStoragePath || '',
      guidelineTextExcerpt: kit.guidelineTextExcerpt || '',
    },
  };
}

export function isManualBriefReady(brief) {
  return Boolean(
    brief?.campaignName?.trim() &&
    brief?.campaignType?.trim() &&
    brief?.keyMessage?.trim() &&
    brief?.contentGoal?.trim()
  );
}
