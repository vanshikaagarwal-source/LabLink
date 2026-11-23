import { describe, expect, it } from 'vitest';
import { Booking, Equipment, SlotRequest } from '../types';
import {
  fairnessScore,
  feasibilityIssue,
  priorityScore,
  runFairSlot,
  scoreRequest,
  urgencyScore,
} from './fairslot';
import { checkDoubleBooking, rangesOverlap, validateSlotRequest } from './booking';
import { DEMO_SLOT_REQUESTS, INITIAL_BOOKINGS, INITIAL_EQUIPMENT } from '../data/mockData';

const equipment = (over: Partial<Equipment> = {}): Equipment => ({
  id: 'eq-a',
  name: 'Machine A',
  code: 'A',
  model: 'A',
  category: 'Cat-1',
  department: 'Dept',
  labName: 'Lab A',
  location: 'Block A',
  capacity: 1,
  status: 'available',
  hourlyRate: 'Free',
  specifications: [],
  safetyRequirements: [],
  supervisor: 'Faculty',
  fairSlotTier: 'Standard',
  utilizationRate: 50,
  description: '',
  ...over,
});

const request = (over: Partial<SlotRequest> = {}): SlotRequest => ({
  id: 'r1',
  studentName: 'Student',
  studentId: 's1',
  projectTitle: 'Project',
  equipmentId: 'eq-a',
  date: '2026-12-01',
  startTime: '10:00',
  endTime: '12:00',
  projectDeadline: '2026-12-10',
  previousUsageHours: 0,
  needScore: 50,
  needJustification: '',
  submittedAt: '2026-11-20 10:00',
  ...over,
});

const approved = (over: Partial<Booking> = {}): Booking => ({
  id: 'b1',
  equipmentId: 'eq-a',
  equipmentName: 'Machine A',
  labName: 'Lab A',
  department: 'Dept',
  studentName: 'Other',
  studentId: 's-other',
  studentEmail: 'other@example.edu',
  facultySupervisor: 'Faculty',
  date: '2026-12-01',
  timeSlot: '11:00 - 13:00',
  durationHours: 2,
  projectTitle: 'P',
  purpose: 'P',
  status: 'approved',
  fairSlotPriorityScore: 0,
  submittedAt: '2026-11-19 10:00',
  ...over,
});

describe('FairSlot formula', () => {
  it('computes P = 0.5U + 0.3F + 0.2N', () => {
    expect(priorityScore(100, 100, 100)).toBe(100);
    expect(priorityScore(80, 50, 20)).toBe(59);
    expect(priorityScore(0, 0, 0)).toBe(0);
  });

  it('rejects out-of-range or non-numeric inputs', () => {
    expect(() => priorityScore(101, 0, 0)).toThrow();
    expect(() => priorityScore(0, -1, 0)).toThrow();
    expect(() => priorityScore(0, 0, Number.NaN)).toThrow();
  });

  it('urgency is 100 near the deadline and 0 far away', () => {
    expect(urgencyScore(0)).toBe(100);
    expect(urgencyScore(3)).toBe(100);
    expect(urgencyScore(60)).toBe(0);
    expect(urgencyScore(90)).toBe(0);
    expect(urgencyScore(10)).toBeGreaterThan(urgencyScore(30));
  });

  it('fairness drops as previous usage rises', () => {
    expect(fairnessScore(0)).toBe(100);
    expect(fairnessScore(10)).toBe(50);
    expect(fairnessScore(40)).toBe(0);
    expect(() => fairnessScore(-2)).toThrow();
  });

  it('scores a request deterministically', () => {
    const s = scoreRequest(request({ projectDeadline: '2026-12-03', previousUsageHours: 10, needScore: 80 }));
    expect(s).toEqual({ urgency: 100, fairness: 50, need: 80, priority: 81 });
  });
});

describe('validation and feasibility', () => {
  it('reports invalid input', () => {
    const errors = validateSlotRequest(
      request({ date: '2026-13-40', startTime: '12:00', endTime: '10:00', needScore: 150 }),
    );
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('marks equipment under maintenance as infeasible', () => {
    expect(feasibilityIssue(request(), equipment({ status: 'maintenance' }), [])).toMatch(/maintenance/);
  });

  it('allows post-deadline use with zero urgency', () => {
    const late = request({ projectDeadline: '2026-11-25' });
    expect(feasibilityIssue(late, equipment(), [])).toBeNull();
    expect(scoreRequest(late).urgency).toBe(0);
    expect(urgencyScore(-5)).toBe(0);
  });

  it('ranks post-deadline use below an active deadline', () => {
    const result = runFairSlot(
      [request({ id: 'late', projectDeadline: '2026-11-25' }), request({ id: 'active' })],
      [equipment()],
      [],
    );
    expect(result[0].request.id).toBe('active');
    expect(result[1].explanation).toMatch(/Post-submission/);
  });

  it('marks a fully booked slot as infeasible', () => {
    expect(feasibilityIssue(request(), equipment(), [approved()])).toMatch(/already booked/);
  });

  it('marks unknown equipment as infeasible', () => {
    expect(feasibilityIssue(request(), undefined, [])).toMatch(/does not exist/);
  });
});

describe('double-booking prevention', () => {
  it('detects overlapping ranges only on the same date', () => {
    expect(rangesOverlap({ date: 'd', start: 600, end: 720 }, { date: 'd', start: 660, end: 780 })).toBe(true);
    expect(rangesOverlap({ date: 'd', start: 600, end: 720 }, { date: 'd', start: 720, end: 780 })).toBe(false);
    expect(rangesOverlap({ date: 'd1', start: 600, end: 720 }, { date: 'd2', start: 600, end: 720 })).toBe(false);
  });

  it('blocks a booking when capacity is full', () => {
    const range = { date: '2026-12-01', start: 600, end: 720 };
    expect(checkDoubleBooking(range, equipment(), 's1', [approved()])).toMatch(/fully booked/);
    expect(checkDoubleBooking(range, equipment({ capacity: 2 }), 's1', [approved()])).toBeNull();
  });

  it('blocks a student from holding two overlapping bookings', () => {
    const range = { date: '2026-12-01', start: 600, end: 720 };
    const own = approved({ equipmentId: 'eq-b', studentId: 's1' });
    expect(checkDoubleBooking(range, equipment(), 's1', [own])).toMatch(/Student already/);
  });
});

describe('runFairSlot', () => {
  it('ranks feasible requests by P and allocates up to capacity', () => {
    const reqs = [
      request({ id: 'low', needScore: 10, projectDeadline: '2027-01-30' }),
      request({ id: 'high', needScore: 90, projectDeadline: '2026-12-02' }),
    ];
    const result = runFairSlot(reqs, [equipment()], []);
    expect(result[0].request.id).toBe('high');
    expect(result[0].outcome).toBe('allocated');
    expect(result[1].outcome).not.toBe('allocated');
  });

  it('breaks ties by earlier deadline, then earlier submission', () => {
    const a = request({ id: 'a', submittedAt: '2026-11-20 12:00' });
    const b = request({ id: 'b', submittedAt: '2026-11-20 09:00' });
    const result = runFairSlot([a, b], [equipment()], []);
    expect(result[0].score!.priority).toBe(result[1].score!.priority);
    expect(result[0].request.id).toBe('b');
    expect(result[0].explanation).toMatch(/Tie/);
  });

  it('never ranks infeasible requests', () => {
    const result = runFairSlot(
      [request({ id: 'bad', needScore: 500 }), request({ id: 'ok' })],
      [equipment()],
      [],
    );
    const bad = result.find((d) => d.request.id === 'bad')!;
    expect(bad.outcome).toBe('infeasible');
    expect(bad.rank).toBeNull();
    expect(bad.score).toBeNull();
  });

  it('offers compatible equipment when the slot is taken', () => {
    const alt = equipment({ id: 'eq-b', name: 'Machine B' });
    const result = runFairSlot(
      [request({ id: 'first', needScore: 90 }), request({ id: 'second', needScore: 10 })],
      [equipment(), alt],
      [],
    );
    const second = result.find((d) => d.request.id === 'second')!;
    expect(second.outcome).toBe('alternative');
    expect(second.alternative?.type).toBe('equipment');
    expect(second.alternative?.equipmentId).toBe('eq-b');
  });

  it('offers another time slot when no compatible equipment exists', () => {
    const result = runFairSlot(
      [request({ id: 'first', needScore: 90 }), request({ id: 'second', needScore: 10 })],
      [equipment()],
      [],
    );
    const second = result.find((d) => d.request.id === 'second')!;
    expect(second.outcome).toBe('alternative');
    expect(second.alternative?.type).toBe('slot');
    expect(second.alternative?.startTime).toBe('12:00');
  });

  it('never double-books existing approved bookings', () => {
    const result = runFairSlot([request({ startTime: '09:00', endTime: '10:00' })], [equipment()], [
      approved({ timeSlot: '09:30 - 11:00' }),
    ]);
    expect(result[0].outcome).toBe('infeasible');
  });

  it('handles an empty request list', () => {
    expect(runFairSlot([], [equipment()], [])).toEqual([]);
  });

  it('runs on the demo scenario with explanations for every request', () => {
    const result = runFairSlot(DEMO_SLOT_REQUESTS, INITIAL_EQUIPMENT, INITIAL_BOOKINGS);
    expect(result).toHaveLength(DEMO_SLOT_REQUESTS.length);
    expect(result.filter((d) => d.outcome === 'allocated')).toHaveLength(3);
    result.forEach((d) => expect(d.explanation.length).toBeGreaterThan(10));
  });
});

describe('booking helpers', () => {
  it('sums a student\'s recent usage on one equipment within 30 days', async () => {
    const { recentUsageHours } = await import('./booking');
    const b = [
      approved({ studentId: 's1', date: '2026-11-25', durationHours: 2 }),
      approved({ studentId: 's1', date: '2026-10-01', durationHours: 5 }), // too old
      approved({ studentId: 's1', equipmentId: 'eq-x', date: '2026-11-25', durationHours: 4 }), // other equipment
      approved({ studentId: 's2', date: '2026-11-25', durationHours: 3 }), // other student
    ];
    expect(recentUsageHours('s1', 'eq-a', '2026-12-01', b)).toBe(2);
  });

  it('detects a student\'s overlapping pending request', async () => {
    const { hasOverlappingRequest } = await import('./booking');
    const existing = request({ id: 'p1' });
    expect(hasOverlappingRequest(request({ id: 'p2', startTime: '11:00', endTime: '13:00' }), [existing])).toBe(true);
    expect(hasOverlappingRequest(request({ id: 'p3', startTime: '12:00', endTime: '13:00' }), [existing])).toBe(false);
  });
});
