import { describe, expect, it } from 'vitest';
import { requestAiPlan, sanitizeAiPlan } from './aiPlanner';
import { INITIAL_EQUIPMENT } from '../data/mockData';

describe('AI planner response validation', () => {
  it('keeps only catalogue equipment and removes duplicates', () => {
    const plan = sanitizeAiPlan(
      {
        summary: 'Robotics project.',
        recommendations: [
          { equipmentId: 'eq-005', reason: 'LiDAR mapping' },
          { equipmentId: 'eq-999', reason: 'hallucinated' },
          { equipmentId: 'eq-005', reason: 'duplicate' },
          { equipmentId: 'eq-002', reason: 'chassis' },
        ],
        suggestedHours: 3,
        tips: ['Check kill switch'],
      },
      INITIAL_EQUIPMENT,
    );
    expect(plan.recommendations.map((r) => r.equipmentId)).toEqual(['eq-005', 'eq-002']);
    expect(plan.suggestedHours).toBe(3);
  });

  it('handles malformed responses safely', () => {
    const plan = sanitizeAiPlan('not json', INITIAL_EQUIPMENT);
    expect(plan.recommendations).toEqual([]);
    expect(plan.suggestedHours).toBe(2);
    expect(sanitizeAiPlan({ suggestedHours: 99 }, INITIAL_EQUIPMENT).suggestedHours).toBe(8);
  });

  it('surfaces server errors without exposing details', async () => {
    const fakeFetch = (async () =>
      new Response(JSON.stringify({ error: 'AI planner is not configured on this server.' }), { status: 503 })) as typeof fetch;
    await expect(requestAiPlan('A robot project', INITIAL_EQUIPMENT, fakeFetch)).rejects.toThrow(/not configured/);
  });
});
