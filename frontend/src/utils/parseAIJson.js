export const parseAIJson = (text) => {
  if (!text || typeof text !== 'string') return null;

  // Attempt 1: Direct JSON parse (handles raw JSON)
  try {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return JSON.parse(trimmed);
    }
  } catch {
    // fall through
  }

  // Attempt 2: Strip markdown code fences
  try {
    const clean = text
      .replace(/^```json\s*$/im, '')
      .replace(/^```\s*$/im, '')
      .replace(/```$/im, '')
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .trim();
    if ((clean.startsWith('{') && clean.endsWith('}')) ||
        (clean.startsWith('[') && clean.endsWith(']'))) {
      return JSON.parse(clean);
    }
  } catch {
    // fall through
  }

  // Attempt 3: Try to find JSON object or array in the text via regex
  try {
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (arrMatch) return JSON.parse(arrMatch[0]);
  } catch {
    // fall through
  }

  // Not valid JSON — return null so the caller can render as markdown
  return null;
};

export const logAIError = (context, request, response, error) => {
  console.error(`\n========== AI ERROR [${context}] ==========`);
  console.error("Request:", JSON.stringify(request, null, 2));
  console.error("Response:", JSON.stringify(response, null, 2));
  console.error("Status:", error?.status || error?.response?.status || "N/A");
  console.error("Message:", error?.message || error);
  console.error("==========================================\n");
};
