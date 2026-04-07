import { callAI } from './client.js';

/**
 * Generate a confidence test sample post using kit + brief context.
 */
export async function generateConfidenceSample({ brandName, kitCards, campaignType, funnelStage, toneShift, brandLanguage }) {
  const kit = kitCards || {};
  const systemPrompt = buildSystemPrompt({ brandName, kit, brandLanguage });

  const userMessage = `Generate a sample LinkedIn post for ${brandName}.
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

  return await callAI(systemPrompt, userMessage, 400);
}

/**
 * Full content generation: LinkedIn + blog in one pass.
 * Returns { linkedin: string, blog: string }
 */
export async function generateContent({ brief, sections }) {
  const kit = brief.kit || {};
  const systemPrompt = buildSystemPrompt({ brandName: brief.brandName, kit, brandLanguage: brief.language });

  const wordTarget = getWordTarget(brief.publishingFrequency);

  const userMessage = `Generate content for ${brief.brandName}.

Campaign: ${brief.campaignName || ''}
Campaign type: ${brief.campaignType || ''}
Audience: ${brief.audienceType || brief.audience || ''}
Tone shift: ${brief.toneShift || 'Keep baseline'}
Funnel stage: ${brief.funnelStage || ''}
Content goal: ${brief.contentGoal || ''}
Key message (anchor for both formats): "${brief.keyMessage || ''}"

Brand voice: ${kit.voiceAdjectives?.join(', ')}
Vocabulary to use: ${kit.vocabulary?.join(', ')}
NEVER use these words: ${kit.restrictedWords?.join(', ')}

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

  const raw = await callAI(systemPrompt, userMessage, 2000);
  try {
    return JSON.parse(raw);
  } catch {
    return { linkedin: raw, blog: '' };
  }
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
  try {
    return JSON.parse(raw);
  } catch {
    return currentContent;
  }
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
