import { useMemo, useState } from 'react';
import { ArrowRightLeft, CircleCheck, CircleX, Clock, Info, Play, RotateCcw, Scale } from 'lucide-react';
import { Booking, Equipment, FairSlotDecision, FairSlotOutcome, SlotRequest } from '../types';
import { runFairSlot } from '../services/fairslot';
import { checkDoubleBooking, requestRange } from '../services/booking';

type FacultyAction = 'approved' | 'rejected' | 'alternative_sent';

interface Props {
  requests: SlotRequest[];
  equipment: Equipment[];
  bookings: Booking[];
  onApprove: (booking: Booking) => void;
  onReject: (booking: Booking) => void;
}

const OUTCOME_STYLE: Record<FairSlotOutcome, { label: string; className: string }> = {
  allocated: { label: 'Recommended', className: 'bg-green-100 text-green-800' },
  alternative: { label: 'Alternative', className: 'bg-amber-100 text-amber-900' },
  waitlisted: { label: 'Waitlisted', className: 'bg-slate-200 text-slate-800' },
  infeasible: { label: 'Not feasible', className: 'bg-red-100 text-red-800' },
};

const ACTION_LABEL: Record<FacultyAction, string> = {
  approved: 'Approved by faculty',
  rejected: 'Rejected by faculty',
  alternative_sent: 'Alternative approved by faculty',
};

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-[11px] font-medium text-slate-500">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function FairSlotPanel({ requests, equipment, bookings, onApprove, onReject }: Props) {
  const [decisions, setDecisions] = useState<FairSlotDecision[] | null>(null);
  const [actions, setActions] = useState<Record<string, FacultyAction>>({});
  const [message, setMessage] = useState('');

  const equipmentById = useMemo(() => new Map(equipment.map((e) => [e.id, e])), [equipment]);

  const run = () => {
    setDecisions(runFairSlot(requests, equipment, bookings));
    setActions({});
    setMessage(
      requests.length
        ? `FairSlot ranked ${requests.length} open request(s). Review each recommendation below.`
        : 'No open requests to rank.',
    );
  };

  const approve = (d: FairSlotDecision, useAlternative: boolean) => {
    const r = d.request;
    const alt = useAlternative ? d.alternative : undefined;
    const eq = equipmentById.get(alt?.equipmentId ?? r.equipmentId);
    if (!eq) return;
    const date = alt?.date ?? r.date;
    const start = alt?.startTime ?? r.startTime;
    const end = alt?.endTime ?? r.endTime;
    const range = requestRange({ ...r, date, startTime: start, endTime: end });
    const clash = checkDoubleBooking(range, eq, r.studentId, bookings);
    if (clash) {
      setMessage(`Cannot approve ${r.studentName}: ${clash}`);
      return;
    }
    onApprove({
      id: `bk-${r.id}`,
      equipmentId: eq.id,
      equipmentName: eq.name,
      labName: eq.labName,
      department: eq.department,
      studentName: r.studentName,
      studentId: r.studentId,
      studentEmail: '',
      facultySupervisor: eq.supervisor,
      date,
      timeSlot: `${start} - ${end}`,
      durationHours: (range.end - range.start) / 60,
      projectTitle: r.projectTitle,
      purpose: r.needJustification,
      status: 'approved',
      fairSlotPriorityScore: d.score?.priority ?? 0,
      submittedAt: r.submittedAt,
      approvalNotes: useAlternative ? 'Approved on FairSlot alternative.' : 'Approved via FairSlot recommendation.',
    });
    setActions((a) => ({ ...a, [r.id]: useAlternative ? 'alternative_sent' : 'approved' }));
    setMessage(`${r.studentName}: booking approved for ${eq.name}, ${date} ${start}–${end}.`);
  };

  const reject = (d: FairSlotDecision) => {
    const r = d.request;
    const eq = equipmentById.get(r.equipmentId);
    onReject({
      id: `bk-${r.id}`,
      equipmentId: r.equipmentId,
      equipmentName: eq?.name ?? r.equipmentId,
      labName: eq?.labName ?? '',
      department: eq?.department ?? '',
      studentName: r.studentName,
      studentId: r.studentId,
      studentEmail: '',
      facultySupervisor: eq?.supervisor ?? '',
      date: r.date,
      timeSlot: `${r.startTime} - ${r.endTime}`,
      durationHours: 0,
      projectTitle: r.projectTitle,
      purpose: r.needJustification,
      status: 'rejected',
      fairSlotPriorityScore: d.score?.priority ?? 0,
      submittedAt: r.submittedAt,
      rejectionReason: d.score ? 'Rejected by faculty after FairSlot review.' : `Rejected: ${d.explanation}`,
    });
    setActions((a) => ({ ...a, [d.request.id]: 'rejected' }));
    setMessage(`${d.request.studentName}: request rejected.`);
  };

  return (
    <section aria-labelledby="fairslot-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7 mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h3 id="fairslot-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="text-sky-800" aria-hidden="true" /> FairSlot Conflict Resolver
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Ranks feasible requests with <strong>P = 0.5U + 0.3F + 0.2N</strong> (U = deadline urgency,
            F = fairness from lower recent usage, N = project need). FairSlot only recommends — faculty decide.
          </p>
          <p className="text-xs text-slate-500 mt-1">Demo scenario: illustrative sample data, not real university records.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            {decisions ? <RotateCcw size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {decisions ? 'Re-run FairSlot' : 'Run FairSlot'}
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="text-sm text-sky-900 min-h-[1.25rem] mb-3">
        {message}
      </p>

      {!decisions ? (
        <div className="p-5 bg-sky-50 rounded-xl text-sm text-sky-900 flex gap-3">
          <Info className="shrink-0" size={18} aria-hidden="true" />
          {requests.length} open request(s) compete for lab equipment. Click <strong>Run FairSlot</strong> to rank them.
        </div>
      ) : (
        <ol className="space-y-4">
          {decisions.map((d) => {
            const r = d.request;
            const eq = equipmentById.get(r.equipmentId);
            const style = OUTCOME_STYLE[d.outcome];
            const action = actions[r.id];
            return (
              <li key={r.id} className="border border-slate-200 rounded-xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {d.rank ? `Rank #${d.rank}` : 'Not ranked'}
                    </p>
                    <h4 className="font-semibold text-slate-900">
                      {r.studentName} — {r.projectTitle}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Clock size={14} aria-hidden="true" />
                      {eq?.name ?? r.equipmentId} · {r.date} · {r.startTime}–{r.endTime} · deadline {r.projectDeadline}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.className}`}>{style.label}</span>
                </div>

                {d.score && (
                  <div className="grid grid-cols-4 gap-2 mt-4 bg-slate-50 rounded-lg p-3 max-w-md" aria-label="FairSlot score breakdown">
                    <ScoreCell label="U urgency" value={d.score.urgency} />
                    <ScoreCell label="F fairness" value={d.score.fairness} />
                    <ScoreCell label="N need" value={d.score.need} />
                    <ScoreCell label="P priority" value={d.score.priority} />
                  </div>
                )}

                <p className="text-sm text-slate-700 mt-3">
                  <span className="font-semibold">Why: </span>
                  {d.explanation}
                </p>

                {d.alternative && (
                  <p className="text-sm text-amber-900 bg-amber-50 rounded-lg p-3 mt-3 flex gap-2">
                    <ArrowRightLeft size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <strong>Suggested {d.alternative.type === 'equipment' ? 'equipment' : 'slot'}:</strong>{' '}
                      {d.alternative.equipmentName}, {d.alternative.date} {d.alternative.startTime}–
                      {d.alternative.endTime}. {d.alternative.reason}
                    </span>
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {action ? (
                    <span className="text-sm font-medium text-slate-700">{ACTION_LABEL[action]}</span>
                  ) : (
                    <>
                      {d.outcome === 'allocated' && (
                        <button
                          type="button"
                          onClick={() => approve(d, false)}
                          aria-label={`Approve request from ${r.studentName}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-700 text-white hover:bg-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                        >
                          <CircleCheck size={16} aria-hidden="true" /> Approve
                        </button>
                      )}
                      {d.alternative && (
                        <button
                          type="button"
                          onClick={() => approve(d, true)}
                          aria-label={`Approve suggested alternative for ${r.studentName}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-amber-700 text-white hover:bg-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                        >
                          <ArrowRightLeft size={16} aria-hidden="true" /> Approve alternative
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => reject(d)}
                        aria-label={`Reject request from ${r.studentName}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-slate-300 text-slate-800 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                      >
                        <CircleX size={16} aria-hidden="true" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
