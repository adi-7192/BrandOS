function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mergeCards(cards) {
  if (cards.length === 0) return {};
  if (cards.length === 1) {
    const card = cards[0];
    return { ...card, extracted: card.extracted_fields || {} };
  }

  const base = cards[0];
  const mergedExtracted = {};

  for (const card of cards) {
    const extracted = card.extracted_fields || {};
    for (const [key, value] of Object.entries(extracted)) {
      if (value) mergedExtracted[key] = value;
    }
  }

  return { ...base, extracted: mergedExtracted };
}

export function buildCanonicalBrief(cards, sourceCardIds = []) {
  const merged = mergeCards(cards);
  const lowConfidence = Number(merged.overall_score || 1) < 0.4;
  const extracted = merged.extracted || {};

  const kit = {
    version: merged.version || 1,
    voiceAdjectives: merged.voice_adjectives || [],
    vocabulary: merged.vocabulary || [],
    restrictedWords: merged.restricted_words || [],
    channelRules: {
      linkedin: merged.channel_rules_linkedin || '',
      blog: merged.channel_rules_blog || '',
    },
    audienceType: merged.audience_type || '',
    buyerSeniority: merged.buyer_seniority || '',
    ageRange: merged.age_range || '',
    industrySector: merged.industry_sector || '',
    industryTarget: merged.industry_target || '',
    funnelStage: merged.funnel_stage || '',
    toneShift: merged.tone_shift || '',
    proofStyle: merged.proof_style || '',
    contentRole: merged.content_role || '',
    contentGoal: merged.content_goal || '',
    publishingFrequency: merged.publishing_frequency || '',
    voiceFormality: merged.formality_level ?? null,
    campaignCoreWhy: merged.campaign_core_why || '',
    pastContentExamples: merged.past_content_examples || '',
    websiteUrl: merged.website_url || '',
    websiteUrls: merged.website_urls || [],
    websiteSummary: merged.website_summary || '',
    guidelineFileUrl: merged.guideline_file_url || '',
    guidelineFileName: merged.guideline_file_name || '',
    guidelineStoragePath: merged.guideline_storage_path || '',
    guidelineTextExcerpt: merged.guideline_text_excerpt || '',
  };

  return {
    brandId: merged.brand_id,
    brandName: merged.brand_name,
    language: merged.language,
    campaignName: extracted.campaignName || merged.email_subject || 'Untitled campaign',
    campaignType: extracted.campaignType || '',
    audience: extracted.audience || kit.audienceType || '',
    audienceType: extracted.audienceType || kit.audienceType || '',
    toneShift: extracted.toneShift || kit.toneShift || '',
    funnelStage: extracted.funnelStage || kit.funnelStage || '',
    contentGoal: extracted.contentGoal || kit.contentGoal || '',
    publishingFrequency: extracted.publishingFrequency || kit.publishingFrequency || '',
    proofStyle: extracted.proofStyle || kit.proofStyle || '',
    contentRole: extracted.contentRole || kit.contentRole || '',
    voiceFormality: extracted.voiceFormality ?? kit.voiceFormality,
    campaignCoreWhy: extracted.campaignCoreWhy || kit.campaignCoreWhy || '',
    keyMessage: extracted.keyMessage || merged.excerpt || merged.email_subject || '',
    lowConfidence,
    sourceCardIds,
    sourceThreadIds: unique(cards.map((card) => card.thread_id)),
    voiceAdjectives: kit.voiceAdjectives,
    restrictedWords: kit.restrictedWords,
    kit,
  };
}
