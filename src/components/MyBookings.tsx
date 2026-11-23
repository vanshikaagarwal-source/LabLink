import { Booking, BookingStatus, SlotRequest } from '../types';

interface Props {
  studentId: string;
  bookings: Booking[];
  pendingRequests: SlotRequest[];
}

const STATUS_STYLE: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-slate-200 text-slate-800',
  cancelled: 'bg-slate-200 text-slate-800',
};

export default function MyBookings({ studentId, bookings, pendingRequests }: Props) {
  const mine = bookings.filter((b) => b.studentId === studentId);
  const myRequests = pendingRequests.filter(
    (r) => r.studentId === studentId && !bookings.some((b) => b.id === `bk-${r.id}`),
  );
  const counts = (['approved', 'pending', 'completed', 'rejected'] as BookingStatus[]).map((s) => ({
    status: s,
    count: mine.filter((b) => b.status === s).length + (s === 'pending' ? myRequests.length : 0),
  }));

  return (
    <section aria-labelledby="mybookings-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
      <h3 id="mybookings-heading" className="text-xl font-bold text-slate-900">My Bookings</h3>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {counts.map((c) => (
          <div key={c.status} className="bg-slate-50 rounded-xl p-4">
            <dt className="text-xs text-slate-600 capitalize">{c.status}</dt>
            <dd className="text-2xl font-bold text-slate-900">{c.count}</dd>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto mt-5">
        <table className="w-full text-sm">
          <caption className="sr-only">Your bookings and pending requests</caption>
          <thead>
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th scope="col" className="py-2 pr-3">Equipment / project</th>
              <th scope="col" className="py-2 pr-3">Date &amp; time</th>
              <th scope="col" className="py-2 pr-3">Status</th>
              <th scope="col" className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2 pr-3"><span className="font-medium">{r.projectTitle}</span></td>
                <td className="py-2 pr-3 whitespace-nowrap">{r.date} · {r.startTime}–{r.endTime}</td>
                <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE.pending}`}>pending</span></td>
                <td className="py-2 text-slate-600">Awaiting faculty FairSlot review</td>
              </tr>
            ))}
            {mine.map((b) => (
              <tr key={b.id} className="border-b border-slate-100">
                <td className="py-2 pr-3">
                  <span className="font-medium">{b.equipmentName}</span>
                  <br />
                  <span className="text-slate-600">{b.projectTitle}</span>
                </td>
                <td className="py-2 pr-3 whitespace-nowrap">{b.date} · {b.timeSlot}</td>
                <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[b.status]}`}>{b.status}</span></td>
                <td className="py-2 text-slate-600">{b.rejectionReason ?? b.approvalNotes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mine.length + myRequests.length === 0 && <p className="text-sm text-slate-600 mt-3">No bookings yet.</p>}
      </div>
    </section>
  );
}
