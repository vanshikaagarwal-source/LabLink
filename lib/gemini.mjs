// Server-side only. Calls Google Gemini to recommend equipment for a project.
// The API key is read from the GEMINI_API_KEY environment variable and is never sent to the browser.

const MAX_DESCRIPTION = 600;
const MAX_CATALOG = 50;
// Tried in order; a model that is unavailable (404) falls through to the next one.
const MODELS = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'].filter(Boolean);

/** Extracts the JSON object from a model reply (tolerates ```json fences or extra text). */
export function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('No JSON object in model reply');
  return JSON.parse(text.slice(start, end + 1));
}

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

/** Validates the request body. Returns { error } or { description, catalog }. */
export function parsePlanRequest(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid JSON body.' };
  const description = clean(body.description, MAX_DESCRIPTION);
  if (description.length < 10) return { error: 'Please describe your project in at least 10 characters.' };
  if (!Array.isArray(body.catalog) || body.catalog.length === 0) return { error: 'Equipment catalog is required.' };
  const catalog = body.catalog.slice(0, MAX_CATALOG).map((e) => ({
    id: clean(e?.id, 40),
    name: clean(e?.name, 120),
    category: clean(e?.category, 80),
    status: clean(e?.status, 20),
  }));
  return { description, catalog };
}

export async function planProject({ description, catalog }, apiKey, fetchImpl = fetch) {
  const prompt =
    'You help university students choose laboratory equipment for their projects.\n' +
    'Only recommend equipment from this catalog (JSON). Never invent IDs. Avoid items with status "maintenance".\n' +
    `Catalog: ${JSON.stringify(catalog)}\n` +
    `Student project description: """${description}"""\n` +
    'Reply with JSON only: {"summary": string (max 2 sentences), "recommendations": ' +
    '[{"equipmentId": string, "reason": string (max 1 sentence)}] (1-3 items, most useful first), ' +
    '"suggestedHours": number (1-8, first session length), "tips": [string] (max 3 short safety or preparation tips)}';

  let lastError = new Error('No Gemini model available');
  for (const model of MODELS) {
    const res = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 4096 },
        }),
      },
    );
    if (!res.ok) {
      const detail = (await res.text().catch(() => '')).slice(0, 300);
      // Logged server-side only (visible in Vercel logs). Never includes the API key.
      console.error(`Gemini ${model} failed: ${res.status} ${detail}`);
      lastError = new Error(`Gemini request failed (${res.status})`);
      if (res.status === 404 || res.status === 429 || res.status >= 500) continue; // try next model
      throw lastError; // 400/401/403: key or request problem, other models won't help
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    try {
      return extractJson(text);
    } catch (err) {
      console.error(`Gemini ${model} returned unparseable output (finishReason=${data?.candidates?.[0]?.finishReason})`);
      lastError = err;
    }
  }
  throw lastError;
}

/** Shared handler logic for Vercel and the Cloud Run server. Returns { status, json }. */
export async function handlePlan(body, apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) return { status: 503, json: { error: 'AI planner is not configured on this server.' } };
  const parsed = parsePlanRequest(body);
  if (parsed.error) return { status: 400, json: { error: parsed.error } };
  try {
    return { status: 200, json: await planProject(parsed, apiKey) };
  } catch {
    return { status: 502, json: { error: 'The AI service is unavailable right now. Please try again.' } };
  }
}
