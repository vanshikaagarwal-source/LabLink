import { Booking, Department, Equipment, SlotRequest } from '../types';

interface Props {
  equipment: Equipment[];
  bookings: Booking[];
  pendingRequests: SlotRequest[];
  departments: Department[];
}

/** Below this utilisation, equipment is flagged as under-used. */
export const UNDERUSED_THRESHOLD = 60;

function barColour(value: number) {
  if (value >= 85) return 'bg-red-600';
  if (value >= UNDERUSED_THRESHOLD) return 'bg-sky-600';
  return 'bg-amber-500';
}

export default function AdminAnalytics({ equipment, bookings, pendingRequests, departments }: Props) {
  const avgUtil = equipment.length
    ? Math.round(equipment.reduce((s, e) => s + e.utilizationRate, 0) / equipment.length)
    : 0;
  const pending = bookings.filter((b) => b.status === 'pending').length + pendingRequests.length;

  const demand = equipment
    .map((e) => ({
      equipment: e,
      requests:
        bookings.filter((b) => b.equipmentId === e.id).length +
        pendingRequests.filter((r) => r.equipmentId === e.id).length,
    }))
    .sort((a, b) => b.requests - a.requests);
  const maxDemand = Math.max(1, ...demand.map((d) => d.requests));
  const underused = equipment.filter((e) => e.utilizationRate < UNDERUSED_THRESHOLD && e.status !== 'maintenance');
  const sortedUtil = [...equipment].sort((a, b) => b.utilizationRate - a.utilizationRate);

  const stats = [
    { label: 'Total equipment', value: equipment.length },
    { label: 'Total bookings', value: bookings.length },
    { label: 'Pending requests', value: pending },
    { label: 'Average utilisation', value: `${avgUtil}%` },
  ];

  return (
    <div className="space-y-8">
      <section aria-labelledby="admin-stats" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
        <h3 id="admin-stats" className="text-xl font-bold text-slate-900">Lab Utilisation Analytics</h3>
        <p className="text-sm text-slate-600 mt-1">Calculated from demo data in this session.</p>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-5">
              <dt className="text-sm text-slate-600">{s.label}</dt>
              <dd className="text-3xl font-bold text-slate-900 mt-1">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section aria-labelledby="util-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
          <h4 id="util-heading" className="font-semibold text-slate-900">Utilisation by equipment</h4>
          <ul className="mt-4 space-y-3">
            {sortedUtil.map((e) => (
              <li key={e.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-800 truncate pr-3">{e.name}</span>
                  <span className="font-semibold text-slate-900">{e.utilizationRate}%</span>
                </div>
                <div
                  className="h-2 bg-slate-100 rounded-full mt-1"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={e.utilizationRate}
                  aria-label={`${e.name} utilisation`}
                >
                  <div className={`h-2 rounded-full ${barColour(e.utilizationRate)}`} style={{ width: `${e.utilizationRate}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-600 mt-4">Red ≥ 85% (overloaded) · Blue normal · Amber &lt; {UNDERUSED_THRESHOLD}% (under-used)</p>
        </section>

        <section aria-labelledby="demand-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
          <h4 id="demand-heading" className="font-semibold text-slate-900">Demand (bookings + pending requests)</h4>
          <ul className="mt-4 space-y-3">
            {demand.map((d) => (
              <li key={d.equipment.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-800 truncate pr-3">{d.equipment.name}</span>
                  <span className="font-semibold text-slate-900">{d.requests}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mt-1" aria-hidden="true">
                  <div className="h-2 rounded-full bg-sky-600" style={{ width: `${(d.requests / maxDemand) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="underused-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
        <h4 id="underused-heading" className="font-semibold text-slate-900">Under-used resources (&lt; {UNDERUSED_THRESHOLD}%)</h4>
        {underused.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {underused.map((e) => (
              <li key={e.id} className="bg-amber-50 text-amber-950 rounded-lg p-3">
                <strong>{e.name}</strong> — {e.utilizationRate}% in {e.labName}. Consider promoting it to other
                departments as an alternative.
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 mt-3">No under-used equipment.</p>
        )}
      </section>

      <section aria-labelledby="dept-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7 overflow-x-auto">
        <h4 id="dept-heading" className="font-semibold text-slate-900">Departments</h4>
        <table className="w-full text-sm mt-3">
          <caption className="sr-only">Department summary</caption>
          <thead>
            <tr className="text-left text-slate-600 border-b border-slate-200">
              <th scope="col" className="py-2 pr-3">Department</th>
              <th scope="col" className="py-2 pr-3">Labs</th>
              <th scope="col" className="py-2 pr-3">Equipment</th>
              <th scope="col" className="py-2 pr-3">Active bookings</th>
              <th scope="col" className="py-2">Utilisation</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium">{d.name}</td>
                <td className="py-2 pr-3">{d.totalLabs}</td>
                <td className="py-2 pr-3">{d.totalEquipment}</td>
                <td className="py-2 pr-3">{d.activeBookings}</td>
                <td className="py-2">{d.utilizationRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
