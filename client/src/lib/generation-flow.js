import { formatFunnelStages, normalizeFunnelStages } from './brand-kit-fields.js';

export function buildBriefOriginMeta(brief) {
  if (brief?.mode === 'sample') {
    return {
      label: 'Sample workflow',
      badge: 'Example data',
      description: 'This is a guided example so you can see how BrandOS moves from brief to final content before your real inbox is connected.',
    };
  }

  if (brief?.mode === 'manual') {
    return {
      label: 'Manual brief',
      badge: 'Manual setup',
      description: 'This campaign was started manually using your saved brand-kit defaults as the starting point.',
    };
  }

  if (Array.isArray(brief?.sourceCardIds) && brief.sourceCardIds.length > 0) {
    return {
      label: 'Inbox brief',
      badge: 'From inbox',
      description: 'This brief came from a stakeholder update that BrandOS extracted into a campaign draft.',
    };
  }

  return {
    label: 'Campaign brief',
    badge: 'In progress',
    description: 'BrandOS is using this brief as the working source of truth for the campaign.',
  };
}

export function buildSampleBrief() {
  return {
    mode: 'sample',
    brandId: '',
    brandName: 'Moodway',
    language: 'English',
    campaignName: 'Virtual try-on launch',
    campaignType: 'Product launch',
    publishDate: '2026-04-22',
    audience: 'Ecommerce leaders evaluating conversion lifts',
    audienceType: 'Ecommerce leaders evaluating conversion lifts',
    toneShift: 'More practical and evidence-led',
    funnelStages: ['Mid funnel — consideration'],
    funnelStage: 'Mid funnel — consideration',
    contentGoal: 'Product awareness',
    publishingFrequency: 'Weekly',
    proofStyle: 'Demo-led',
    voiceFormality: 3,
    campaignCoreWhy: 'Show how virtual try-on removes buying friction.',
    keyMessage: 'Moodway helps shoppers choose the right size with more confidence before checkout.',
    lowConfidence: false,
    sourceCardIds: ['sample-card-1'],
    sourceThreadIds: ['sample-thread-1'],
    voiceAdjectives: ['Clear', 'Practical', 'Confident'],
    restrictedWords: ['cheap'],
    kit: {
      voiceAdjectives: ['Clear', 'Practical', 'Confident'],
      vocabulary: ['conversion', 'size confidence', 'try-on'],
      restrictedWords: ['cheap'],
      channelRules: {
        linkedin: 'Open with a sharp practical insight and keep the CTA light.',
        blog: 'Use subheadings and explain the commercial problem before the product.',
      },
      audienceType: 'Ecommerce leaders evaluating conversion lifts',
      buyerSeniority: 'Director',
      ageRange: '30-50',
      industrySector: 'Retail technology',
      industryTarget: 'Fashion ecommerce',
      funnelStages: ['Mid funnel — consideration'],
      funnelStage: 'Mid funnel — consideration',
      toneShift: 'More practical and evidence-led',
      proofStyle: 'Demo-led',
      contentGoal: 'Product awareness',
      publishingFrequency: 'Weekly',
      voiceFormality: 3,
      campaignCoreWhy: 'Show how virtual try-on removes buying friction.',
      pastContentExamples: 'Short practical launch posts with clear business outcomes.',
      websiteUrl: 'https://moodway.ai',
      websiteUrls: ['https://moodway.ai'],
      websiteSummary: 'Moodway provides virtual try-on and size confidence tools for ecommerce teams.',
      guidelineFileUrl: '',
      guidelineFileName: '',
      guidelineStoragePath: '',
      guidelineTextExcerpt: 'Stay practical, specific, and grounded in buying friction.',
    },
  };
}

export function buildSampleOutput() {
  return {
    linkedin: `Virtual try-on is only useful if it reduces buying friction in the moments that matter.

Moodway helps ecommerce teams give shoppers more size confidence before checkout, so fewer customers bounce or second-guess the purchase.

For a launch story, that means focusing less on flashy AI language and more on the real commercial shift:
- fewer hesitation points
- clearer product fit
- more confidence to buy

If your team is trying to improve conversion without making the experience feel heavier, virtual try-on should feel practical from the first click.

#virtualtryon #ecommerce #retailtech`,
    blog: `Moodway's virtual try-on launch is not just a feature story. It is a story about reducing hesitation before checkout.

Many ecommerce teams still lose potential buyers at the point where customers are unsure about fit, sizing, or product confidence. That uncertainty creates friction, and friction quietly lowers conversion.

Moodway is positioning virtual try-on as a practical way to remove that uncertainty. Instead of leading with abstract AI claims, the launch story works best when it shows a direct commercial outcome: more confidence before purchase.

That framing matters because retail teams do not need another novelty feature. They need tools that make shoppers feel ready to buy.

For BrandOS, this sample campaign shows how a stakeholder update becomes a campaign brief, then turns into channel-ready content shaped by the brand kit. The brief defines the audience, tone, and commercial point of view. The content workflow then translates that into a concise LinkedIn narrative and a fuller blog story without losing the original campaign intent.

That is the real product promise: keep the brand voice intact while moving faster from campaign context to usable output.`,
  };
}

export function buildSamplePreviewSections() {
  return {
    linkedin: {
      hook: 'virtual try-on should reduce hesitation before checkout.',
      body: 'Moodway helps ecommerce teams give shoppers more size confidence, so the launch story stays practical and conversion-focused.',
      closing: 'Lead with the buying-friction problem, then show how the product removes it.',
      hashtags: '#virtualtryon #ecommerce #retailtech',
    },
    blog: {
      headline: "Moodway's virtual try-on launch should feel practical, not flashy",
      opening: 'The strongest launch story starts with the moment shoppers hesitate before buying.',
      body: 'Frame the product as a way to reduce uncertainty, improve confidence, and support conversion without adding friction to the experience.',
      closing: 'That gives the campaign a clear commercial angle while still sounding like the brand.',
    },
  };
}

export function buildConfirmedBrief(brief, overrides) {
  return {
    ...brief,
    campaignName: overrides.campaignName || brief.campaignName || '',
    campaignType: overrides.campaignType || brief.campaignType || '',
    publishDate: overrides.publishDate ?? brief.publishDate ?? '',
    keyMessage: overrides.keyMessage || brief.keyMessage || '',
    toneShift: overrides.toneShift || brief.toneShift || '',
    audienceType: overrides.audienceType || brief.audienceType || '',
    audience: overrides.audienceType || brief.audienceType || brief.audience || '',
    contentGoal: overrides.contentGoal || brief.contentGoal || '',
  };
}

export function createInitialPreviewSections() {
  return {
    linkedin: { hook: '', body: '', closing: '', hashtags: '#brand #content #marketing' },
    blog: { headline: '', opening: '', body: '', closing: '' },
  };
}

export function mergePreviewSuggestions(currentSections, suggestedSections) {
  const current = currentSections || createInitialPreviewSections();
  const suggested = suggestedSections || {};

  return {
    linkedin: mergeSection(current.linkedin, suggested.linkedin, {
      hook: '',
      body: '',
      closing: '',
      hashtags: '#brand #content #marketing',
    }),
    blog: mergeSection(current.blog, suggested.blog, {
      headline: '',
      opening: '',
      body: '',
      closing: '',
    }),
  };
}

export function hasPreviewContent(sections, format) {
  const section = sections?.[format] || {};
  return Object.entries(section).some(([key, value]) => {
    const nextValue = String(value || '').trim();
    if (!nextValue) return false;
    if (key === 'hashtags' && nextValue === '#brand #content #marketing') return false;
    return true;
  });
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
  const funnelStages = normalizeFunnelStages(kit.funnelStages || kit.funnelStage);
  const formattedFunnelStages = formatFunnelStages(funnelStages);

  return {
    mode: 'manual',
    brandId: brand?.id,
    brandName: brand?.name || '',
    language: brand?.language || 'English',
    campaignName: '',
    campaignType: '',
    publishDate: '',
    audience: kit.audienceType || '',
    audienceType: kit.audienceType || '',
    toneShift: kit.toneShift || '',
    funnelStages,
    funnelStage: formattedFunnelStages,
    contentGoal: kit.contentGoal || '',
    publishingFrequency: kit.publishingFrequency || '',
    proofStyle: kit.proofStyle || '',
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
      funnelStages,
      funnelStage: formattedFunnelStages,
      toneShift: kit.toneShift || '',
      proofStyle: kit.proofStyle || '',
      contentGoal: kit.contentGoal || '',
      publishingFrequency: kit.publishingFrequency || '',
      voiceFormality: kit.voiceFormality ?? null,
      campaignCoreWhy: kit.campaignCoreWhy || '',
      pastContentExamples: kit.pastContentExamples || '',
      websiteUrl: kit.websiteUrl || '',
      websiteUrls: kit.websiteUrls || [],
      websiteSummary: kit.websiteSummary || '',
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

function mergeSection(currentSection = {}, suggestedSection = {}, defaults = {}) {
  const merged = {};

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const currentValue = normalizeSectionValue(currentSection[key], defaultValue);
    const suggestedValue = normalizeSectionValue(suggestedSection[key], defaultValue);
    merged[key] = currentValue || suggestedValue || defaultValue;
  }

  return merged;
}

function normalizeSectionValue(value, fallback = '') {
  const nextValue = String(value || '').trim();
  if (!nextValue) return '';

  const fallbackValue = String(fallback || '').trim();
  return nextValue === fallbackValue ? '' : nextValue;
}
