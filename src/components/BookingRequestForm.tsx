import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Booking, Equipment, SlotRequest } from '../types';
import { hasOverlappingRequest, recentUsageHours, validateSlotRequest } from '../services/booking';
import { feasibilityIssue, scoreRequest } from '../services/fairslot';

export interface DemoStudent {
  name: string;
  id: string;
}

interface Props {
  student: DemoStudent;
  equipment: Equipment[];
  bookings: Booking[];
  pendingRequests: SlotRequest[];
  selectedEquipmentId: string;
  onSelectEquipment: (id: string) => void;
  onSubmit: (request: SlotRequest) => void;
}

const NEED_LEVELS = [
  { value: 90, label: 'Essential — no alternative method' },
  { value: 70, label: 'Important — main project work' },
  { value: 50, label: 'Helpful — could use a simpler tool' },
];

const inputClass =
  'mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function BookingRequestForm({
  student,
  equipment,
  bookings,
  pendingRequests,
  selectedEquipmentId,
  onSelectEquipment,
  onSubmit,
}: Props) {
  const [projectTitle, setProjectTitle] = useState('');
  const [justification, setJustification] = useState('');
  const [date, setDate] = useState('2026-11-28');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [deadline, setDeadline] = useState('2026-12-10');
  const [need, setNeed] = useState(70);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');

  useEffect(() => setSuccess(''), [selectedEquipmentId]);

  const usage = recentUsageHours(student.id, selectedEquipmentId, date, bookings);

  const draft: SlotRequest = {
    id: `req-${student.id}-${date}-${startTime}-${selectedEquipmentId}`,
    studentName: student.name,
    studentId: student.id,
    projectTitle: projectTitle.trim(),
    equipmentId: selectedEquipmentId,
    date,
    startTime,
    endTime,
    projectDeadline: deadline,
    previousUsageHours: usage,
    needScore: need,
    needJustification: justification.trim(),
    submittedAt: '',
  };

  // Score preview only needs the scheduling fields, so it shows before the title is typed.
  const preview = useMemo(() => {
    const scoringDraft = { ...draft, projectTitle: draft.projectTitle || 'preview' };
    if (validateSlotRequest(scoringDraft).length) return null;
    try {
      return scoreRequest(scoringDraft);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, deadline, need, usage, startTime, endTime, selectedEquipmentId]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    const found: string[] = [];
    if (!draft.needJustification) found.push('Please explain why you need this equipment.');
    const validation = validateSlotRequest(draft);
    found.push(...validation);
    if (!validation.length) {
      const issue = feasibilityIssue(draft, equipment.find((eq) => eq.id === draft.equipmentId), bookings);
      if (issue) found.push(issue);
      if (hasOverlappingRequest(draft, pendingRequests)) {
        found.push('You already have a pending request that overlaps this time.');
      }
    }
    setErrors(found);
    if (found.length) return;
    const now = new Date();
    onSubmit({ ...draft, id: `req-${now.getTime()}`, submittedAt: now.toISOString().slice(0, 16).replace('T', ' ') });
    setSuccess('Request submitted. Faculty will review it with FairSlot.');
    setProjectTitle('');
    setJustification('');
  };

  return (
    <section aria-labelledby="booking-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
      <h3 id="booking-heading" className="text-xl font-bold text-slate-900">Project-Based Booking</h3>
      <p className="text-sm text-slate-600 mt-1">
        Describe your project and request a slot. Booking as <strong>{student.name}</strong> (demo student).
      </p>

      <form onSubmit={submit} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <label className="text-sm font-medium text-slate-800 md:col-span-2">
          Equipment
          <select value={selectedEquipmentId} onChange={(e) => onSelectEquipment(e.target.value)} className={inputClass}>
            {equipment.map((eq) => (
              <option key={eq.id} value={eq.id} disabled={eq.status === 'maintenance'}>
                {eq.name}{eq.status === 'maintenance' ? ' (maintenance)' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-800 md:col-span-2">
          Project title
          <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} maxLength={120} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800 md:col-span-2">
          Why do you need this equipment?
          <textarea value={justification} onChange={(e) => setJustification(e.target.value)} maxLength={500} rows={2} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800">
          Project deadline
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800">
          Start time
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800">
          End time
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-800 md:col-span-2">
          How essential is it?
          <select value={need} onChange={(e) => setNeed(Number(e.target.value))} className={inputClass}>
            {NEED_LEVELS.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </label>

        <div className="md:col-span-2 bg-sky-50 rounded-xl p-4 text-sm text-sky-950">
          <p className="font-semibold">Your FairSlot score preview</p>
          {preview ? (
            <p className="mt-1">
              U {preview.urgency} · F {preview.fairness} ({usage} h used in last 30 days) · N {preview.need} →{' '}
              <strong>P = {preview.priority}</strong>
            </p>
          ) : (
            <p className="mt-1">Fill in valid dates and times to see your score.</p>
          )}
        </div>

        {errors.length > 0 && (
          <div role="alert" className="md:col-span-2 bg-red-50 text-red-800 rounded-lg p-3 text-sm">
            <ul className="list-disc pl-5">{errors.map((er) => <li key={er}>{er}</li>)}</ul>
          </div>
        )}
        <p role="status" aria-live="polite" className="md:col-span-2 text-sm text-green-800 font-medium">{success}</p>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <Send size={16} aria-hidden="true" /> Submit request
          </button>
        </div>
      </form>
    </section>
  );
}
