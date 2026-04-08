import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const PROVIDER = process.env.AI_PROVIDER || 'anthropic';

const MODELS = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

export const MODEL = MODELS[PROVIDER] || MODELS.anthropic;

const PROVIDER_KEY_MAP = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

let anthropicClient, openaiClient, geminiClient;

if (PROVIDER === 'anthropic') {
  anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} else if (PROVIDER === 'openai') {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else if (PROVIDER === 'gemini') {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export function isAIConfigured() {
  const envKey = PROVIDER_KEY_MAP[PROVIDER];
  return Boolean(envKey && process.env[envKey]);
}

/**
 * Unified AI call across providers.
 * @param {string} systemPrompt
 * @param {string} userMessage
 * @param {number} maxTokens
 * @returns {Promise<string>}
 */
export async function callAI(systemPrompt, userMessage, maxTokens = 1000) {
  if (PROVIDER === 'anthropic') {
    const msg = await anthropicClient.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    return msg.content[0].text.trim();
  }

  if (PROVIDER === 'openai') {
    const resp = await openaiClient.chat.completions.create({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return resp.choices[0].message.content.trim();
  }

  if (PROVIDER === 'gemini') {
    const model = geminiClient.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });
    const result = await model.generateContent(userMessage);
    return result.response.text().trim();
  }

  throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}. Valid values: anthropic | openai | gemini`);
}

export async function testAIConnection() {
  if (!isAIConfigured()) {
    throw new Error(`Missing credentials for ${PROVIDER}.`);
  }

  const response = await callAI(
    'You are a connection test for BrandOS. Reply with exactly OK.',
    'Return OK.',
    10
  );

  return response;
}

export default anthropicClient;
