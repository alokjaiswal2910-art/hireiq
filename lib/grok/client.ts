const GROK_URL = 'https://api.x.ai/v1/responses';
const GROK_MODEL = 'grok-4.20-beta-latest-non-reasoning';

interface GrokOutputItem {
  type?: string;
  role?: string;
  content?: Array<{ type?: string; text?: string }>;
}

/**
 * Parse raw text as JSON with the same normalizations as the Gemini client.
 */
function parseJsonResponse<T>(rawText: string): T {
  rawText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  try {
    return JSON.parse(rawText) as T;
  } catch {
    const normalized = rawText
      .replace(/^\s*\(\s*/, '{').replace(/\s*\)\s*$/, '}')
      .replace(/'([^']+)':/g, '"$1":')
      .replace(/: 'strong'/g, ': "strong"').replace(/: 'moderate'/g, ': "moderate"').replace(/: 'weak'/g, ': "weak"');
    try {
      return JSON.parse(normalized) as T;
    } catch {
      const openBrace = rawText.indexOf('{');
      const openParen = rawText.indexOf('(');
      const start = openBrace !== -1 ? (openParen !== -1 && openParen < openBrace ? openParen : openBrace) : openParen;
      const openChar = start !== -1 ? rawText[start] : '';
      const closeChar = openChar === '(' ? ')' : '}';
      if (start !== -1) {
        let depth = 0;
        let end = -1;
        for (let i = start; i < rawText.length; i++) {
          const c = rawText[i];
          if (c === openChar) depth++;
          else if (c === closeChar) {
            depth--;
            if (depth === 0) {
              end = i;
              break;
            }
          }
        }
        if (end !== -1) {
          let slice = rawText.slice(start, end + 1);
          if (openChar === '(') slice = '{' + slice.slice(1, -1) + '}';
          const fixed = slice.replace(/'([^']+)':/g, '"$1":');
          try {
            return JSON.parse(fixed) as T;
          } catch {
            try {
              return JSON.parse(slice) as T;
            } catch {
              // fall through
            }
          }
        }
      }
      throw new Error(`Failed to parse Grok JSON response: ${rawText.slice(0, 200)}`);
    }
  }
}

/**
 * Call Grok (xAI) Responses API and parse the response as JSON.
 * Uses GROK_API_KEY or XAI_API_KEY. Same signature as callGemini.
 */
export async function callGrok<T = unknown>(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<T> {
  const apiKey = process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('GROK_API_KEY or XAI_API_KEY is not set');
  }

  const body = {
    model: GROK_MODEL,
    input: [
      { role: 'system' as const, content: 'You must respond with only valid JSON. No markdown, no code fences, no explanation. Use double quotes for all keys and string values.' },
      { role: 'user' as const, content: prompt },
    ],
    store: false,
  };

  const response = await fetch(GROK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      let retryIn = 60;
      try {
        const err = JSON.parse(errorText);
        const msg = (err?.error?.message ?? err?.message ?? '') as string;
        const match = msg.match(/retry in (\d+(?:\.\d+)?)/i) || msg.match(/(\d+(?:\.\d+)?)\s*sec/i);
        if (match) retryIn = Math.ceil(Number(match[1]));
      } catch {
        // use default
      }
      throw new Error(
        `Our AI service is temporarily at capacity. Please wait ${retryIn} seconds and click "Resume Interview" to try again.`
      );
    }
    if (response.status === 400 || response.status === 401) {
      throw new Error(
        'Invalid Grok API key. Get a key from https://console.x.ai and set GROK_API_KEY in .env.local. Make sure you use your xAI key, not your Google/Gemini key.'
      );
    }
    throw new Error(`Grok API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = (await response.json()) as { output?: GrokOutputItem[] };

  let rawText = '';
  const output = result?.output;
  if (Array.isArray(output)) {
    const assistantMessage = output.find(
      (item: GrokOutputItem) => item?.type === 'message' && item?.role === 'assistant'
    );
    if (assistantMessage?.content) {
      for (const part of assistantMessage.content) {
        if (part?.type === 'output_text' && typeof part.text === 'string') {
          rawText += part.text;
        }
      }
    }
  }

  if (!rawText.trim()) {
    throw new Error('Grok returned an empty response');
  }

  return parseJsonResponse<T>(rawText);
}
