const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
  role: 'user';
}

interface GeminiRequestBody {
  contents: GeminiContent[];
  generationConfig: {
    responseMimeType: 'application/json';
    temperature?: number;
    maxOutputTokens?: number;
  };
}

/**
 * Call Gemini 2.5 Flash and parse the response as JSON.
 * Always returns parsed JSON — throws on failure.
 */
export async function callGemini<T = unknown>(
  prompt: string,
  options: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<T> {
  const body: GeminiRequestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429) {
      let retryIn = 60;
      try {
        const err = JSON.parse(errorText);
        const msg = err?.error?.message ?? '';
        const match = msg.match(/retry in (\d+(?:\.\d+)?)/i) || msg.match(/(\d+(?:\.\d+)?)\s*sec/i);
        if (match) retryIn = Math.ceil(Number(match[1]));
      } catch {
        // use default
      }
      throw new Error(
        `Our AI service is temporarily at capacity. Please wait ${retryIn} seconds and click "Resume Interview" to try again.`
      );
    }
    throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 200)}`);
  }

  const result = await response.json();

  // Extract the text content from the response
  let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini returned an empty response');
  }

  // Normalize: strip markdown code fences and trim
  rawText = rawText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

  try {
    return JSON.parse(rawText) as T;
  } catch {
    // Gemini sometimes returns Python-style or malformed JSON; try to fix common issues
    let normalized = rawText
      // Python dict: leading ( and trailing ) -> { }
      .replace(/^\s*\(\s*/, '{').replace(/\s*\)\s*$/, '}')
      // Convert Python-style single-quoted keys to double-quoted: 'key': -> "key":
      .replace(/'([^']+)':/g, '"$1":')
      // Fix experience_fit enum values
      .replace(/: 'strong'/g, ': "strong"').replace(/: 'moderate'/g, ': "moderate"').replace(/: 'weak'/g, ': "weak"');
    try {
      return JSON.parse(normalized) as T;
    } catch {
      // Try extracting the first complete { ... } or ( ... ) object
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
              // fall through to throw
            }
          }
        }
      }
      throw new Error(`Failed to parse Gemini JSON response: ${rawText.slice(0, 200)}`);
    }
  }
}
