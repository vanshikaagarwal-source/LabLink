import { useMemo, useState } from 'react';
import { FlaskConical, Search, CalendarDays, ShieldCheck } from 'lucide-react';
import FairSlotPanel from './components/FairSlotPanel';
import EquipmentDiscovery from './components/EquipmentDiscovery';
import AIProjectPlanner from './components/AIProjectPlanner';
import BookingRequestForm, { DemoStudent } from './components/BookingRequestForm';
import MyBookings from './components/MyBookings';
import AdminAnalytics from './components/AdminAnalytics';
import { DEMO_SLOT_REQUESTS, INITIAL_BOOKINGS, INITIAL_DEPARTMENTS, INITIAL_EQUIPMENT } from './data/mockData';
import { Booking, SlotRequest } from './types';

type Role = 'Student' | 'Faculty' | 'Admin';

/** Demo identity until real authentication is added. */
const DEMO_STUDENT: DemoStudent = { name: 'Sarah Chen', id: 'STU-2023-ME-409' };

const ROLE_LINKS: Record<Role, { href: string; label: string }[]> = {
  Student: [
    { href: '#ai-heading', label: 'AI planner' },
    { href: '#discovery-heading', label: 'Find equipment' },
    { href: '#booking-heading', label: 'Request a slot' },
    { href: '#mybookings-heading', label: 'My bookings' },
  ],
  Faculty: [{ href: '#fairslot-heading', label: 'Review requests with FairSlot' }],
  Admin: [
    { href: '#admin-stats', label: 'Overview' },
    { href: '#underused-heading', label: 'Under-used resources' },
    { href: '#dept-heading', label: 'Departments' },
  ],
};

const ROLE_SUBTITLE: Record<Role, string> = {
  Student: `Signed in as ${DEMO_STUDENT.name} (demo student)`,
  Faculty: 'Review competing requests — FairSlot recommends, you decide',
  Admin: 'Monitor equipment utilisation and demand across departments',
};

function App() {
  const [role, setRole] = useState<Role>('Student');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [slotRequests, setSlotRequests] = useState<SlotRequest[]>(DEMO_SLOT_REQUESTS);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(INITIAL_EQUIPMENT[0].id);

  /** Requests that faculty have not yet approved or rejected. */
  const openRequests = useMemo(
    () => slotRequests.filter((r) => !bookings.some((b) => b.id === `bk-${r.id}`)),
    [slotRequests, bookings],
  );

  const addBooking = (booking: Booking) => setBookings((prev) => [...prev, booking]);

  const requestEquipment = (id: string) => {
    setSelectedEquipmentId(id);
    document.getElementById('booking-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white px-3 py-2 rounded"
      >
        Skip to main content
      </a>
      <header className="bg-white border-b border-slate-200 px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 p-2 rounded-lg">
            <FlaskConical className="text-white" size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-900">LabLink</h1>
            <p className="text-xs text-slate-600">Smart Laboratory Access</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="role-select" className="text-sm text-slate-600">
            View as
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <option>Student</option>
            <option>Faculty</option>
            <option>Admin</option>
          </select>
        </div>
      </header>

      <main id="main" className="max-w-7xl mx-auto px-6 py-10">
        <section className="mb-10">
          <p className="text-sky-700 font-semibold text-sm mb-2">ONE CAMPUS. EVERY LAB. SMARTER ACCESS.</p>
          <h2 className="text-4xl font-bold text-slate-900 mb-3">Welcome to LabLink</h2>
          <p className="text-slate-600 max-w-2xl">
            Discover specialised equipment, access laboratories across departments and manage project-based bookings
            through one platform with transparent, fair allocation.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10" aria-label="Platform features">
          {[
            { label: 'Equipment Discovery', icon: Search, desc: 'Find specialised equipment across campus.' },
            { label: 'Project-Based Booking', icon: CalendarDays, desc: 'Request slots with your project context.' },
            { label: 'FairSlot Allocation', icon: ShieldCheck, desc: 'Resolve conflicts fairly and transparently.' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm ">
              <item.icon className="text-sky-800 mb-4" size={28} aria-hidden="true" />
              <h3 className="font-semibold text-lg mb-2">{item.label}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>

        <section
          className="bg-gradient-to-r from-sky-800 to-sky-600 text-white rounded-2xl p-6 shadow-md mb-8 flex flex-wrap items-center justify-between gap-4"
          aria-labelledby="role-heading"
        >
          <div>
            <h3 id="role-heading" className="text-xl font-bold">
              {role} Dashboard
            </h3>
            <p className="text-sm text-sky-100 mt-1">{ROLE_SUBTITLE[role]}</p>
          </div>
          <nav aria-label={`${role} sections`} className="flex flex-wrap gap-2">
            {ROLE_LINKS[role].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </section>

        {role === 'Student' && (
          <div className="space-y-8">
            <AIProjectPlanner equipment={INITIAL_EQUIPMENT} onRequest={requestEquipment} />
            <EquipmentDiscovery equipment={INITIAL_EQUIPMENT} onRequest={requestEquipment} />
            <BookingRequestForm
              student={DEMO_STUDENT}
              equipment={INITIAL_EQUIPMENT}
              bookings={bookings}
              pendingRequests={openRequests}
              selectedEquipmentId={selectedEquipmentId}
              onSelectEquipment={setSelectedEquipmentId}
              onSubmit={(r) => setSlotRequests((prev) => [...prev, r])}
            />
            <MyBookings studentId={DEMO_STUDENT.id} bookings={bookings} pendingRequests={openRequests} />
          </div>
        )}

        {role === 'Faculty' && (
          <FairSlotPanel
            requests={openRequests}
            equipment={INITIAL_EQUIPMENT}
            bookings={bookings}
            onApprove={addBooking}
            onReject={addBooking}
          />
        )}

        {role === 'Admin' && (
          <AdminAnalytics
            equipment={INITIAL_EQUIPMENT}
            bookings={bookings}
            pendingRequests={openRequests}
            departments={INITIAL_DEPARTMENTS}
          />
        )}

        <footer className="text-center text-sm text-slate-600 mt-10">
          LabLink · Smart University Laboratory Resource-Sharing Platform · Demo data only
        </footer>
      </main>
    </div>
  );
}

export default App;
