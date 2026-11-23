import { Equipment } from '../types';

export interface AiRecommendation {
  equipmentId: string;
  equipmentName: string;
  reason: string;
}

export interface AiPlan {
  summary: string;
  recommendations: AiRecommendation[];
  suggestedHours: number;
  tips: string[];
}

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Validates the raw Gemini response. Drops any equipment ID that is not in the
 * catalog (guards against hallucinated items) and clamps numbers and lengths.
 */
export function sanitizeAiPlan(raw: unknown, equipment: Equipment[]): AiPlan {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const byId = new Map(equipment.map((e) => [e.id, e]));
  const seen = new Set<string>();
  const recommendations: AiRecommendation[] = (Array.isArray(obj.recommendations) ? obj.recommendations : [])
    .map((r) => (r && typeof r === 'object' ? (r as Record<string, unknown>) : {}))
    .filter((r) => {
      const id = text(r.equipmentId, 40);
      if (!byId.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 3)
    .map((r) => {
      const id = text(r.equipmentId, 40);
      return { equipmentId: id, equipmentName: byId.get(id)!.name, reason: text(r.reason, 240) };
    });

  const hours = Number(obj.suggestedHours);
  return {
    summary: text(obj.summary, 400),
    recommendations,
    suggestedHours: Number.isFinite(hours) ? Math.min(8, Math.max(1, Math.round(hours))) : 2,
    tips: (Array.isArray(obj.tips) ? obj.tips : []).map((t) => text(t, 200)).filter(Boolean).slice(0, 3),
  };
}

/** Calls the server-side /api/plan endpoint. The Gemini API key never reaches the browser. */
export async function requestAiPlan(
  description: string,
  equipment: Equipment[],
  fetchImpl: typeof fetch = fetch,
): Promise<AiPlan> {
  const catalog = equipment.map(({ id, name, category, status }) => ({ id, name, category, status }));
  let res: Response;
  try {
    res = await fetchImpl('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, catalog }),
    });
  } catch {
    throw new Error('Could not reach the AI planner. Check your connection.');
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : '';
    throw new Error(message || 'AI planner is available on the deployed site only.');
  }
  return sanitizeAiPlan(data, equipment);
}
