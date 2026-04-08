import { callAI } from './client.js';
import { parseStructuredJson } from './structuredOutput.js';

const SYSTEM_PROMPT = `You are an expert brand strategist extracting a brand voice kit from seed content.
Extract the following from the provided inputs and return a JSON object only — no preamble.

Return exactly this structure:
{
  "voiceAdjectives": [string, string, string],   // exactly 3 adjectives that describe the brand's voice
  "vocabulary": [string, ...],                   // 5–8 words or short phrases this brand uses consistently
  "restrictedWords": [string, ...],              // 3–6 words this brand should NEVER use
  "channelRules": {
    "linkedin": "string",                        // one concise rule string for LinkedIn posts
    "blog": "string"                             // one concise rule string for blog posts
  }
}

Rules:
- Voice adjectives must be genuinely distinctive — not generic (e.g. not "professional", "quality")
- Vocabulary comes from patterns in the seed content, not invented
- Restricted words are words that clash with this brand's positioning
- Channel rules must include word limits appropriate for publishing frequency
- If there is an uploaded guideline excerpt, treat it as a high-authority source of explicit rules
- Audience, campaign type, funnel stage, proof style, and role in the sales cycle should influence how specific the rules feel
- If formality is provided, reflect it in the voice and channel rules
- Respond ONLY with the JSON object. No markdown fences.`;

/**
 * Extract brand kit cards from seed content using Claude.
 * Returns: { voiceAdjectives, vocabulary, restrictedWords, channelRules }
 */
export async function extractBrandKit(params) {
  const userMessage = buildKitExtractionUserMessage(params);
  const raw = await callAI(SYSTEM_PROMPT, userMessage, 800);
  const fallback = {
    voiceAdjectives: ['Authentic', 'Confident', 'Approachable'],
    vocabulary: ['innovation', 'community', 'experience', 'craft', 'quality'],
    restrictedWords: ['cheap', 'discount', 'guarantee'],
    channelRules: {
      linkedin: 'Max 220 words · Hook in line 1 · Max 3 hashtags · No em dashes',
      blog: '700–900 words · Subheadings required · End with a question or call to action',
    },
  };

  const { data, usedFallback } = parseStructuredJson(raw, {
    fallback,
    validate: (value) => (
      Array.isArray(value?.voiceAdjectives)
      && Array.isArray(value?.vocabulary)
      && Array.isArray(value?.restrictedWords)
      && typeof value?.channelRules === 'object'
      && typeof value?.channelRules?.linkedin === 'string'
      && typeof value?.channelRules?.blog === 'string'
    ),
  });

  if (usedFallback) {
    console.warn('Brand kit extraction returned invalid JSON. Using fallback kit cards.');
  }

  return data;
}

export function buildKitExtractionUserMessage(params) {
  const {
    brandName,
    websiteUrl,
    pastContentExamples,
    guidelineTextExcerpt,
    audienceType,
    buyerSeniority,
    ageRange,
    industrySector,
    industryTarget,
    campaignType,
    funnelStage,
    contentGoal,
    publishingFrequency,
    brandLanguage,
    primaryMarket,
    toneShift,
    proofStyle,
    contentRole,
    voiceFormality,
  } = params;

  return `Brand: ${brandName}
Market: ${primaryMarket || 'Not specified'}
Language: ${brandLanguage || 'English'}
Audience: ${audienceType || 'Not specified'} — ${buyerSeniority || ''}
Age range: ${ageRange || 'Not specified'}
Industry sector: ${industrySector || 'Not specified'}
Target industry: ${industryTarget || 'Not specified'}
Campaign type: ${campaignType || 'Not specified'}
Funnel stage: ${funnelStage || 'Not specified'}
Content goal: ${contentGoal || 'Not specified'}
Tone shift: ${toneShift || 'Keep baseline'}
Proof style: ${proofStyle || 'Not specified'}
Content role: ${contentRole || 'Not specified'}
Formality level: ${voiceFormality ?? 'Balanced'}
Publishing frequency: ${publishingFrequency || 'Weekly'}

${websiteUrl ? `Website URL (assume content was read): ${websiteUrl}` : ''}

${pastContentExamples ? `Past content examples:\n${pastContentExamples}` : 'No past content examples provided.'}

${guidelineTextExcerpt ? `Uploaded brand guideline excerpt:\n${guidelineTextExcerpt}` : 'No uploaded brand guideline excerpt provided.'}`;
}
