// Server-side only. Calls Google Gemini to recommend equipment for a project.
// The API key is read from the GEMINI_API_KEY environment variable and is never sent to the browser.

const MAX_DESCRIPTION = 600;
const MAX_CATALOG = 50;
const MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

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

  const res = await fetchImpl(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.3, maxOutputTokens: 800 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  return JSON.parse(text);
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
