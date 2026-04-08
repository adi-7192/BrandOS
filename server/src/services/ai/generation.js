import { callAI } from './client.js';
import { parseStructuredJson } from './structuredOutput.js';

/**
 * Generate a confidence test sample post using kit + brief context.
 */
export async function generateConfidenceSample({
  brandName,
  kitCards,
  campaignType,
  funnelStage,
  toneShift,
  brandLanguage,
  currentSample,
  feedbackChips,
  feedbackNotes,
}) {
  const kit = kitCards || {};
  const systemPrompt = buildSystemPrompt({ brandName, kit, brandLanguage });
  const userMessage = buildConfidenceUserMessage({
    brandName,
    kit,
    campaignType,
    funnelStage,
    toneShift,
    brandLanguage,
    currentSample,
    feedbackChips,
    feedbackNotes,
  });
  return await callAI(systemPrompt, userMessage, 400);
}

/**
 * Full content generation: LinkedIn + blog in one pass.
 * Returns { linkedin: string, blog: string }
 */
export async function generateContent({ brief, sections }) {
  const kit = brief.kit || {};
  const systemPrompt = buildSystemPrompt({ brandName: brief.brandName, kit, brandLanguage: brief.language });
  const userMessage = buildGenerationUserMessage({ brief, sections });

  const raw = await callAI(systemPrompt, userMessage, 2000);
  const fallback = { linkedin: String(raw || '').trim(), blog: '' };
  const { data, usedFallback } = parseStructuredJson(raw, {
    fallback,
    validate: (value) => typeof value?.linkedin === 'string' && typeof value?.blog === 'string',
  });

  if (usedFallback) {
    console.warn('Content generation returned invalid JSON. Falling back to raw LinkedIn output.');
  }

  return data;
}

export async function generatePreviewSuggestions({ brief }) {
  const kit = brief.kit || {};
  const systemPrompt = buildSystemPrompt({ brandName: brief.brandName, kit, brandLanguage: brief.language });
  const userMessage = buildPreviewSuggestionUserMessage({ brief });
  const raw = await callAI(systemPrompt, userMessage, 900);

  const fallback = buildPreviewSuggestionFallback(brief);
  const { data, usedFallback } = parseStructuredJson(raw, {
    fallback,
    validate: (value) => (
      typeof value?.linkedin?.hook === 'string' &&
      typeof value?.linkedin?.body === 'string' &&
      typeof value?.linkedin?.closing === 'string' &&
      typeof value?.linkedin?.hashtags === 'string' &&
      typeof value?.blog?.headline === 'string' &&
      typeof value?.blog?.opening === 'string' &&
      typeof value?.blog?.body === 'string' &&
      typeof value?.blog?.closing === 'string'
    ),
  });

  if (usedFallback) {
    console.warn('Preview suggestion generation returned invalid JSON. Falling back to heuristic preview suggestions.');
  }

  return data;
}

/**
 * Iterate on existing content with a natural language instruction.
 * Re-injects full brand kit to prevent drift.
 */
export async function iterateContent({ brief, instruction, currentContent }) {
  const kit = brief.kit || {};
  const systemPrompt = buildSystemPrompt({ brandName: brief.brandName, kit, brandLanguage: brief.language });

  const userMessage = `You are refining existing content for ${brief.brandName}.

Current LinkedIn post:
${currentContent?.linkedin || ''}

Current blog post:
${currentContent?.blog || ''}

Instruction: ${instruction}

Brand voice (ALWAYS apply): ${kit.voiceAdjectives?.join(', ')}
Vocabulary (ALWAYS use): ${kit.vocabulary?.join(', ')}
NEVER use these words: ${kit.restrictedWords?.join(', ')}

Apply the instruction while keeping the brand voice. Return ONLY a JSON object:
{
  "linkedin": "updated linkedin post",
  "blog": "updated blog post"
}`;

  const raw = await callAI(systemPrompt, userMessage, 2000);
  const { data, usedFallback } = parseStructuredJson(raw, {
    fallback: currentContent,
    validate: (value) => typeof value?.linkedin === 'string' && typeof value?.blog === 'string',
  });

  if (usedFallback) {
    console.warn('Content iteration returned invalid JSON. Keeping current content.');
  }

  return data;
}

// Shared system prompt builder
function buildSystemPrompt({ brandName, kit, brandLanguage }) {
  return `You are an expert content writer generating on-brand content for ${brandName}.

Brand voice: ${kit.voiceAdjectives?.join(', ') || 'Professional, clear, engaging'}
Vocabulary to use: ${kit.vocabulary?.join(', ') || ''}
Words NEVER to use (hard constraint): ${kit.restrictedWords?.join(', ') || 'none'}
Language: ${brandLanguage || 'English'}

After generating, silently check that no restricted words appear. If any appear, revise before responding.
Never explain your process. Return only the requested content.`;
}

function getWordTarget(frequency) {
  const map = { 'Daily': 400, '2–3 times per week': 500, 'Weekly': 700, 'Bi-weekly': 800, 'Monthly or less': 1000 };
  return map[frequency] || 700;
}

export function buildGenerationUserMessage({ brief, sections }) {
  const kit = brief.kit || {};
  const wordTarget = getWordTarget(brief.publishingFrequency);

  return `Generate content for ${brief.brandName}.

Campaign: ${brief.campaignName || ''}
Campaign type: ${brief.campaignType || ''}
Audience: ${brief.audienceType || brief.audience || ''}
Tone shift: ${brief.toneShift || 'Keep baseline'}
Funnel stage: ${brief.funnelStage || ''}
Content goal: ${brief.contentGoal || ''}
Proof style: ${brief.proofStyle || 'Match the brand default'}
Content role: ${brief.contentRole || 'Standard campaign content'}
Voice formality (1 informal - 5 formal): ${brief.voiceFormality ?? 'Use the brand default'}
Campaign core why: ${brief.campaignCoreWhy || ''}
Key message (anchor for both formats): "${brief.keyMessage || ''}"

Brand voice: ${kit.voiceAdjectives?.join(', ')}
Vocabulary to use: ${kit.vocabulary?.join(', ')}
NEVER use these words: ${kit.restrictedWords?.join(', ')}
Brand-specific LinkedIn rule: ${kit.channelRules?.linkedin || 'Hook in line 1 · Max 3 hashtags · No em dashes'}
Brand-specific blog rule: ${kit.channelRules?.blog || 'Use subheadings and a clear closing'}
Website evidence summary: ${kit.websiteSummary || 'No website evidence summary available'}
Guideline excerpt: ${kit.guidelineTextExcerpt || 'No uploaded guideline excerpt available'}

LinkedIn requirements:
- Max 220 words
- Hook in line 1 (attention-grabbing, no em dashes)
- Max 3 hashtags at the end
- Write in ${brief.language || 'English'}
${sections?.linkedin?.hook ? `- Use this hook: ${sections.linkedin.hook}` : ''}

Blog requirements:
- Target ${wordTarget} words
- Use subheadings
- End with a question if goal is thought leadership
- Write in ${brief.language || 'English'}
${sections?.blog?.headline ? `- Use this headline: ${sections.blog.headline}` : ''}

Return ONLY a JSON object:
{
  "linkedin": "full linkedin post text",
  "blog": "full blog post text"
}`;
} 

export function buildPreviewSuggestionUserMessage({ brief, format }) {
  const requestedFormat = format === 'linkedin'
    ? 'LinkedIn post'
    : format === 'blog'
      ? 'Blog post'
      : 'LinkedIn post and blog post';
  const formatRequirements = format === 'linkedin'
    ? `LinkedIn structure:
- "hook": one opening line that earns attention
- "body": 2-4 short sentences that develop the key message
- "closing": one CTA or takeaway line
- "hashtags": 2-3 relevant hashtags`
    : format === 'blog'
      ? `Blog structure:
- "headline": one clear title
- "opening": 1-2 opening sentences
- "body": 3-5 sentence summary of the main argument
- "closing": one concise closing takeaway`
      : `LinkedIn structure:
- "hook": one opening line that earns attention
- "body": 2-4 short sentences that develop the key message
- "closing": one CTA or takeaway line
- "hashtags": 2-3 relevant hashtags

Blog structure:
- "headline": one clear title
- "opening": 1-2 opening sentences
- "body": 3-5 sentence summary of the main argument
- "closing": one concise closing takeaway`;

  return `Draft preview sections for a ${requestedFormat} for ${brief.brandName}.

Campaign: ${brief.campaignName || ''}
Campaign type: ${brief.campaignType || ''}
Audience: ${brief.audienceType || brief.audience || ''}
Tone shift: ${brief.toneShift || 'Keep baseline'}
Content goal: ${brief.contentGoal || ''}
Key message: ${brief.keyMessage || ''}
Language: ${brief.language || 'English'}
Proof style: ${brief.proofStyle || brief.kit?.proofStyle || 'Brand default'}
Content role: ${brief.contentRole || brief.kit?.contentRole || 'Standard campaign content'}
Brand voice: ${brief.kit?.voiceAdjectives?.join(', ') || ''}
Vocabulary to use: ${brief.kit?.vocabulary?.join(', ') || ''}
Restricted words to avoid: ${brief.kit?.restrictedWords?.join(', ') || 'none'}
LinkedIn rule: ${brief.kit?.channelRules?.linkedin || 'Hook in line 1'}
Blog rule: ${brief.kit?.channelRules?.blog || 'Use subheadings'}
Website evidence summary: ${brief.kit?.websiteSummary || 'No website evidence summary available'}
Guideline excerpt: ${brief.kit?.guidelineTextExcerpt || 'No uploaded guideline excerpt available'}

Write suggestions that help a marketer review and tweak quickly. Do not leave fields blank.

${formatRequirements}

Return ONLY a JSON object:
{
  "linkedin": {
    "hook": "opening line suggestion",
    "body": "main body suggestion",
    "closing": "closing suggestion",
    "hashtags": "#tag1 #tag2 #tag3"
  },
  "blog": {
    "headline": "draft headline",
    "opening": "draft opening",
    "body": "draft body summary",
    "closing": "draft closing"
  }
}`;
}

export function buildConfidenceUserMessage({
  brandName,
  kit,
  campaignType,
  funnelStage,
  toneShift,
  brandLanguage,
  currentSample,
  feedbackChips,
  feedbackNotes,
}) {
  const hasFeedback = Array.isArray(feedbackChips) && feedbackChips.length > 0 || String(feedbackNotes || '').trim();

  if (hasFeedback && currentSample) {
    return `Refine this existing LinkedIn sample for ${brandName}.
Campaign type: ${campaignType || 'Brand awareness'}
Funnel stage: ${funnelStage || 'Top of funnel'}
Tone shift: ${toneShift || 'Keep baseline'}

Current sample:
${currentSample}

Feedback to address: ${feedbackChips?.join(', ') || 'No chips selected'}
Additional notes: ${String(feedbackNotes || '').trim() || 'None'}

Requirements:
- Keep the same underlying campaign intent while improving the draft
- Strictly follow the brand voice: ${kit.voiceAdjectives?.join(', ')}
- Use vocabulary: ${kit.vocabulary?.join(', ')}
- NEVER use these words: ${kit.restrictedWords?.join(', ')}
- Max 150 words
- Strong hook in line 1
- Max 2 hashtags
- Write in ${brandLanguage || 'English'}`;
  }

  return `Generate a sample LinkedIn post for ${brandName}.
Campaign type: ${campaignType || 'Brand awareness'}
Funnel stage: ${funnelStage || 'Top of funnel'}
Tone shift: ${toneShift || 'Keep baseline'}

Requirements:
- Strictly follow the brand voice: ${kit.voiceAdjectives?.join(', ')}
- Use vocabulary: ${kit.vocabulary?.join(', ')}
- NEVER use these words: ${kit.restrictedWords?.join(', ')}
- Max 150 words
- Strong hook in line 1
- Max 2 hashtags
- Write in ${brandLanguage || 'English'}`;
}

function buildPreviewSuggestionFallback(brief) {
  const brandSlug = String(brief.brandName || 'brand')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 18);
  const campaignName = brief.campaignName || brief.campaignType || 'your next campaign';
  const keyMessage = brief.keyMessage || 'Share the core message clearly and credibly.';
  const audience = brief.audienceType || brief.audience || 'the right audience';
  const goal = brief.contentGoal || 'move the campaign forward';

  return {
    linkedin: {
      hook: `${campaignName} starts with a clearer reason to care.`,
      body: `${keyMessage} This matters for ${audience}, and the post should make that value obvious without overexplaining.`,
      closing: `Use this post to ${goal.toLowerCase()}.`,
      hashtags: `#${brandSlug || 'brand'} #marketing #content`,
    },
    blog: {
      headline: campaignName,
      opening: `${keyMessage} This draft should quickly orient readers to why the campaign matters now.`,
      body: `Explain the main idea, add proof or product context, and connect it back to ${audience}.`,
      closing: `Close by reinforcing the takeaway and helping the reader understand the next step.`,
    },
  };
}
