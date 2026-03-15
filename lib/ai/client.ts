import { callGemini } from '@/lib/gemini/client';
import { callGrok } from '@/lib/grok/client';

/**
 * Call the configured AI provider and return parsed JSON.
 * If GROK_API_KEY or XAI_API_KEY is set, uses Grok; otherwise uses Gemini.
 */
export async function callAI<T = unknown>(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<T> {
  const useGrok = !!(process.env.GROK_API_KEY ?? process.env.XAI_API_KEY);
  if (useGrok) {
    return callGrok<T>(prompt, options);
  }
  return callGemini<T>(prompt, options);
}
