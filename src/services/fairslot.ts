/**
 * FairSlot — transparent, deadline-aware allocation engine.
 *
 *   P = 0.5·U + 0.3·F + 0.2·N
 *
 * U  deadline urgency (0–100)   — closer deadline → higher
 * F  fairness (0–100)           — less recent usage of this equipment → higher
 * N  project/equipment need (0–100)
 *
 * Deterministic: same input → same output. No AI involved.
 * FairSlot only RECOMMENDS. Faculty make the final approval decision.
 */
import {
  AlternativeOption,
  Booking,
  Equipment,
  FairSlotDecision,
  FairSlotScore,
  SlotRequest,
} from '../types';
import {
  TimeRange,
  bookingRange,
  daysBetween,
  fromMinutes,
  rangesOverlap,
  requestRange,
  validateSlotRequest,
} from './booking';

export const WEIGHTS = { urgency: 0.5, fairness: 0.3, need: 0.2 } as const;

/** Deadline ≤ this many days away → maximum urgency. */
export const URGENCY_MAX_DAYS = 3;
/** Deadline ≥ this many days away → zero urgency. */
export const URGENCY_ZERO_DAYS = 60;
/** Usage (hours in last 30 days) at which fairness reaches 0. */
export const FAIRNESS_CAP_HOURS = 20;
/** Lab hours used when searching for an alternative slot. */
export const LAB_OPEN = 9 * 60;
export const LAB_CLOSE = 18 * 60;
export const ALT_SEARCH_DAYS = 3;
const SLOT_STEP_MIN = 30;

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function urgencyScore(daysToDeadline: number): number {
  if (!Number.isFinite(daysToDeadline)) throw new Error('daysToDeadline must be a finite number.');
  if (daysToDeadline < 0) return 0; // post-submission use: allowed, lowest urgency
  if (daysToDeadline <= URGENCY_MAX_DAYS) return 100;
  if (daysToDeadline >= URGENCY_ZERO_DAYS) return 0;
  return round1(
    (100 * (URGENCY_ZERO_DAYS - daysToDeadline)) / (URGENCY_ZERO_DAYS - URGENCY_MAX_DAYS),
  );
}

export function fairnessScore(previousUsageHours: number): number {
  if (!Number.isFinite(previousUsageHours) || previousUsageHours < 0) {
    throw new Error('previousUsageHours must be a number ≥ 0.');
  }
  return round1(clamp(100 * (1 - previousUsageHours / FAIRNESS_CAP_HOURS)));
}

export function priorityScore(u: number, f: number, n: number): number {
  for (const [name, v] of [['U', u], ['F', f], ['N', n]] as const) {
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      throw new Error(`${name} must be between 0 and 100 (got ${v}).`);
    }
  }
  return round1(WEIGHTS.urgency * u + WEIGHTS.fairness * f + WEIGHTS.need * n);
}

export function scoreRequest(request: SlotRequest): FairSlotScore {
  const urgency = urgencyScore(daysBetween(request.date, request.projectDeadline));
  const fairness = fairnessScore(request.previousUsageHours);
  const need = request.needScore;
  return { urgency, fairness, need, priority: priorityScore(urgency, fairness, need) };
}

/** Returns null if feasible, otherwise the reason it cannot be scheduled as requested. */
export function feasibilityIssue(
  request: SlotRequest,
  equipment: Equipment | undefined,
  bookings: Booking[],
): string | null {
  const errors = validateSlotRequest(request);
  if (errors.length) return `Invalid request: ${errors.join(' ')}`;
  if (!equipment) return 'Requested equipment does not exist.';
  if (equipment.status === 'maintenance') return `${equipment.name} is under maintenance.`;
  const range = requestRange(request);
  const studentClash = bookings.some(
    (b) => b.studentId === request.studentId && b.status === 'approved' && rangesOverlap(bookingRange(b), range),
  );
  if (studentClash) return 'Student already has an approved booking at this time.';
  const taken = bookings.filter(
    (b) => b.equipmentId === equipment.id && b.status === 'approved' && rangesOverlap(bookingRange(b), range),
  ).length;
  if (taken >= equipment.capacity) {
    return `All ${equipment.capacity} seat(s) are already booked at this time.`;
  }
  return null;
}

/** Tie-break: higher P → earlier deadline → earlier submission → id. */
function compareRanked(
  a: { request: SlotRequest; score: FairSlotScore },
  b: { request: SlotRequest; score: FairSlotScore },
): number {
  return (
    b.score.priority - a.score.priority ||
    a.request.projectDeadline.localeCompare(b.request.projectDeadline) ||
    a.request.submittedAt.localeCompare(b.request.submittedAt) ||
    a.request.id.localeCompare(b.request.id)
  );
}

/** Tracks seats used during one FairSlot run (existing approvals + tentative allocations). */
class SeatLedger {
  private held: { equipmentId: string; range: TimeRange }[];

  constructor(bookings: Booking[]) {
    this.held = bookings
      .filter((b) => b.status === 'approved')
      .map((b) => ({ equipmentId: b.equipmentId, range: bookingRange(b) }));
  }

  hasSeat(equipment: Equipment, range: TimeRange): boolean {
    if (equipment.status === 'maintenance') return false;
    const used = this.held.filter(
      (h) => h.equipmentId === equipment.id && rangesOverlap(h.range, range),
    ).length;
    return used < equipment.capacity;
  }

  hold(equipmentId: string, range: TimeRange) {
    this.held.push({ equipmentId, range });
  }
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Alternative finder: 1) compatible equipment (same category) at the same time,
 * 2) otherwise the next free slot on the same equipment before the deadline.
 */
export function findAlternative(
  request: SlotRequest,
  equipment: Equipment,
  allEquipment: Equipment[],
  ledger: SeatLedger,
): AlternativeOption | undefined {
  const range = requestRange(request);

  const compatible = allEquipment.find(
    (e) => e.id !== equipment.id && e.category === equipment.category && ledger.hasSeat(e, range),
  );
  if (compatible) {
    return {
      type: 'equipment',
      equipmentId: compatible.id,
      equipmentName: compatible.name,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      reason: `Same category (${compatible.category}) and free at the requested time in ${compatible.labName}.`,
    };
  }

  if (equipment.status === 'maintenance') return undefined;
  const duration = range.end - range.start;
  for (let offset = 0; offset <= ALT_SEARCH_DAYS; offset++) {
    const date = addDays(request.date, offset);
    const postDeadline = daysBetween(request.date, request.projectDeadline) < 0;
    if (!postDeadline && daysBetween(date, request.projectDeadline) < 0) break;
    for (let start = LAB_OPEN; start + duration <= LAB_CLOSE; start += SLOT_STEP_MIN) {
      const candidate: TimeRange = { date, start, end: start + duration };
      if (offset === 0 && rangesOverlap(candidate, range)) continue;
      if (ledger.hasSeat(equipment, candidate)) {
        return {
          type: 'slot',
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          date,
          startTime: fromMinutes(start),
          endTime: fromMinutes(start + duration),
          reason: 'Next free slot on the same equipment.',
        };
      }
    }
  }
  return undefined;
}

function describeScore(s: FairSlotScore, daysLeft: number, hours: number): string {
  const deadlineText =
    daysLeft < 0
      ? `Post-submission use: slot is ${-daysLeft} day(s) after the deadline, so lowest urgency (U=0)`
      : `Deadline ${daysLeft} day(s) after the slot (U=${s.urgency})`;
  return (
    `P = 0.5×${s.urgency} + 0.3×${s.fairness} + 0.2×${s.need} = ${s.priority}. ` +
    `${deadlineText}; ` +
    `${hours} h used in the last 30 days (F=${s.fairness}); need N=${s.need}.`
  );
}

/**
 * Runs FairSlot over a set of competing requests.
 * Infeasible requests are never ranked; they may still receive an alternative.
 */
export function runFairSlot(
  requests: SlotRequest[],
  equipmentList: Equipment[],
  bookings: Booking[],
): FairSlotDecision[] {
  const byId = new Map(equipmentList.map((e) => [e.id, e]));
  const ledger = new SeatLedger(bookings);
  const decisions: FairSlotDecision[] = [];
  const feasible: { request: SlotRequest; score: FairSlotScore }[] = [];

  const infeasible: { request: SlotRequest; issue: string }[] = [];

  for (const request of requests) {
    const issue = feasibilityIssue(request, byId.get(request.equipmentId), bookings);
    if (issue) infeasible.push({ request, issue });
    else feasible.push({ request, score: scoreRequest(request) });
  }

  feasible.sort(compareRanked);

  feasible.forEach(({ request, score }, i) => {
    const equipment = byId.get(request.equipmentId)!;
    const range = requestRange(request);
    const daysLeft = daysBetween(request.date, request.projectDeadline);
    const tie = feasible.some((o) => o.request.id !== request.id && o.score.priority === score.priority);
    const base =
      `Ranked #${i + 1} of ${feasible.length} feasible request(s). ` +
      describeScore(score, daysLeft, request.previousUsageHours) +
      (tie ? ' Tie on P broken by earlier deadline, then earlier submission.' : '');

    if (ledger.hasSeat(equipment, range)) {
      ledger.hold(equipment.id, range);
      decisions.push({ request, score, rank: i + 1, outcome: 'allocated', explanation: `${base} Recommended for approval.` });
      return;
    }
    const alternative = findAlternative(request, equipment, equipmentList, ledger);
    if (alternative) {
      ledger.hold(alternative.equipmentId, toRange(alternative));
      decisions.push({
        request,
        score,
        rank: i + 1,
        outcome: 'alternative',
        explanation: `${base} Requested slot taken by higher-priority request(s); alternative offered.`,
        alternative,
      });
    } else {
      decisions.push({
        request,
        score,
        rank: i + 1,
        outcome: 'waitlisted',
        explanation: `${base} No seat or alternative available; waitlisted.`,
      });
    }
  });

  // Infeasible requests are handled after ranked ones so they never take seats from them.
  for (const { request, issue } of infeasible) {
    const equipment = byId.get(request.equipmentId);
    const canSuggest =
      equipment && !issue.startsWith('Invalid');
    const alternative = canSuggest ? findAlternative(request, equipment, equipmentList, ledger) : undefined;
    if (alternative) ledger.hold(alternative.equipmentId, toRange(alternative));
    decisions.push({
      request,
      score: null,
      rank: null,
      outcome: 'infeasible',
      explanation: `Not ranked: ${issue}${alternative ? ' An alternative is suggested.' : ''}`,
      alternative,
    });
  }

  // Ranked decisions first (by rank), then infeasible ones in input order.
  return decisions.sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER));
}

function toRange(alt: AlternativeOption): TimeRange {
  return requestRange({ date: alt.date, startTime: alt.startTime, endTime: alt.endTime } as SlotRequest);
}
