import { Booking, Equipment, SlotRequest } from '../types';

/** Statuses that occupy an equipment slot. */
const BLOCKING_STATUSES: Booking['status'][] = ['approved'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface TimeRange {
  date: string;
  start: number; // minutes from midnight
  end: number;
}

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(value);
}

export function toMinutes(time: string): number {
  const match = TIME_RE.exec(time);
  if (!match) throw new Error(`Invalid time "${time}". Use HH:MM (24h).`);
  return Number(match[1]) * 60 + Number(match[2]);
}

export function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Parses the existing "09:00 - 12:00" booking format. */
export function bookingRange(booking: Booking): TimeRange {
  const [start, end] = booking.timeSlot.split('-').map((t) => t.trim());
  return { date: booking.date, start: toMinutes(start), end: toMinutes(end) };
}

export function requestRange(request: SlotRequest): TimeRange {
  return { date: request.date, start: toMinutes(request.startTime), end: toMinutes(request.endTime) };
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.date === b.date && a.start < b.end && b.start < a.end;
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** Returns a list of validation errors; empty means the request is well-formed. */
export function validateSlotRequest(request: SlotRequest): string[] {
  const errors: string[] = [];
  if (!request.id?.trim()) errors.push('Request id is required.');
  if (!request.studentId?.trim()) errors.push('Student id is required.');
  if (!request.equipmentId?.trim()) errors.push('Equipment id is required.');
  if (!request.projectTitle?.trim()) errors.push('Project title is required.');
  if (!isValidDate(request.date)) errors.push('Booking date must be a valid YYYY-MM-DD date.');
  if (!isValidDate(request.projectDeadline)) errors.push('Project deadline must be a valid YYYY-MM-DD date.');
  if (!TIME_RE.test(request.startTime) || !TIME_RE.test(request.endTime)) {
    errors.push('Start and end times must use HH:MM (24h).');
  } else if (toMinutes(request.endTime) <= toMinutes(request.startTime)) {
    errors.push('End time must be after start time.');
  }
  if (!Number.isFinite(request.previousUsageHours) || request.previousUsageHours < 0) {
    errors.push('Previous usage hours must be a number ≥ 0.');
  }
  if (!Number.isFinite(request.needScore) || request.needScore < 0 || request.needScore > 100) {
    errors.push('Need score must be between 0 and 100.');
  }
  return errors;
}

/** Number of seats on this equipment already taken by approved bookings overlapping the range. */
export function seatsTaken(range: TimeRange, equipmentId: string, bookings: Booking[]): number {
  return bookings.filter(
    (b) =>
      b.equipmentId === equipmentId &&
      BLOCKING_STATUSES.includes(b.status) &&
      rangesOverlap(bookingRange(b), range),
  ).length;
}

export function seatsFree(range: TimeRange, equipment: Equipment, bookings: Booking[]): number {
  return Math.max(0, equipment.capacity - seatsTaken(range, equipment.id, bookings));
}

/**
 * Double-booking guard. Returns an error message if the new booking cannot be
 * added, or null if it is safe to add.
 */
export function checkDoubleBooking(
  range: TimeRange,
  equipment: Equipment,
  studentId: string,
  bookings: Booking[],
): string | null {
  const studentClash = bookings.some(
    (b) =>
      b.studentId === studentId &&
      BLOCKING_STATUSES.includes(b.status) &&
      rangesOverlap(bookingRange(b), range),
  );
  if (studentClash) return 'Student already has an approved booking that overlaps this time.';
  if (seatsFree(range, equipment, bookings) === 0) {
    return `${equipment.name} is fully booked for this time (capacity ${equipment.capacity}).`;
  }
  return null;
}

/** Hours a student used this equipment (approved/completed) in the 30 days before `date`. */
export function recentUsageHours(
  studentId: string,
  equipmentId: string,
  date: string,
  bookings: Booking[],
): number {
  return bookings
    .filter(
      (b) =>
        b.studentId === studentId &&
        b.equipmentId === equipmentId &&
        (b.status === 'approved' || b.status === 'completed') &&
        daysBetween(b.date, date) >= 0 &&
        daysBetween(b.date, date) <= 30,
    )
    .reduce((sum, b) => sum + b.durationHours, 0);
}

/** True if the student already has a pending request overlapping this range. */
export function hasOverlappingRequest(request: SlotRequest, pending: SlotRequest[]): boolean {
  const range = requestRange(request);
  return pending.some(
    (p) => p.id !== request.id && p.studentId === request.studentId && rangesOverlap(requestRange(p), range),
  );
}
