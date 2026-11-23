import { useMemo, useState } from 'react';
import { MapPin, Search, User } from 'lucide-react';
import { Equipment, EquipmentStatus } from '../types';

interface Props {
  equipment: Equipment[];
  onRequest: (equipmentId: string) => void;
}

const STATUS_STYLE: Record<EquipmentStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800' },
  in_use: { label: 'In use now', className: 'bg-amber-100 text-amber-900' },
  reserved: { label: 'Reserved', className: 'bg-blue-100 text-sky-900' },
  maintenance: { label: 'Maintenance', className: 'bg-red-100 text-red-800' },
};

const selectClass =
  'border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500';

export default function EquipmentDiscovery({ equipment, onRequest }: Props) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  const departments = useMemo(() => [...new Set(equipment.map((e) => e.department))].sort(), [equipment]);
  const categories = useMemo(() => [...new Set(equipment.map((e) => e.category))].sort(), [equipment]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return equipment.filter((e) => {
      const text = [e.name, e.model, e.category, e.department, e.labName, e.description, ...e.specifications]
        .join(' ')
        .toLowerCase();
      return (
        (!q || text.includes(q)) &&
        (department === 'all' || e.department === department) &&
        (category === 'all' || e.category === category) &&
        (status === 'all' || e.status === status)
      );
    });
  }, [equipment, query, department, category, status]);

  const reset = () => {
    setQuery('');
    setDepartment('all');
    setCategory('all');
    setStatus('all');
  };

  return (
    <section aria-labelledby="discovery-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm  p-7">
      <h3 id="discovery-heading" className="text-xl font-bold text-slate-900">Smart Lab Discovery</h3>
      <p className="text-sm text-slate-600 mt-1">Search equipment across all departments. Demo data only.</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5">
        <div className="md:col-span-2 relative">
          <label htmlFor="eq-search" className="sr-only">Search equipment</label>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="eq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: CNC, GPU, microscope, LiDAR…"
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          />
        </div>
        <label className="sr-only" htmlFor="f-dept">Department</label>
        <select id="f-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={selectClass}>
          <option value="all">All departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-cat">Category</label>
        <select id="f-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className="sr-only" htmlFor="f-status">Availability</label>
        <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="all">Any availability</option>
          {Object.entries(STATUS_STYLE).map(([value, s]) => (
            <option key={value} value={value}>{s.label}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-slate-600 mt-4" aria-live="polite">
        {results.length} of {equipment.length} items
        {results.length !== equipment.length && (
          <button type="button" onClick={reset} className="ml-3 text-sky-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded">
            Clear filters
          </button>
        )}
      </p>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {results.map((e) => {
          const s = STATUS_STYLE[e.status];
          return (
            <li key={e.id} className="border border-slate-200 rounded-xl p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-sky-800">{e.category}</p>
                  <h4 className="font-semibold text-slate-900">{e.name}</h4>
                  <p className="text-xs text-slate-500">{e.model}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.className}`}>{s.label}</span>
              </div>
              <p className="text-sm text-slate-700 mt-2">{e.description}</p>
              <ul className="text-xs text-slate-600 mt-2 list-disc pl-5 space-y-0.5">
                {e.specifications.slice(0, 3).map((spec) => <li key={spec}>{spec}</li>)}
              </ul>
              <div className="text-xs text-slate-600 mt-3 space-y-1">
                <p className="flex items-center gap-1"><MapPin size={13} aria-hidden="true" /> {e.labName} · {e.location}</p>
                <p className="flex items-center gap-1"><User size={13} aria-hidden="true" /> {e.supervisor} · {e.department} · capacity {e.capacity}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Utilisation {e.utilizationRate}%</span>
                <button
                  type="button"
                  onClick={() => onRequest(e.id)}
                  disabled={e.status === 'maintenance'}
                  aria-label={`Request a slot for ${e.name}`}
                  className="px-3 py-1.5 rounded-lg text-sm bg-sky-700 text-white hover:bg-sky-800 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                >
                  {e.status === 'maintenance' ? 'Unavailable' : 'Request slot'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {results.length === 0 && <p className="text-sm text-slate-600 mt-4">No equipment matches these filters.</p>}
    </section>
  );
}
