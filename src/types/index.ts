export type UserRole = 'public' | 'student' | 'faculty' | 'admin';

export type EquipmentStatus = 'available' | 'in_use' | 'maintenance' | 'reserved';

export interface Equipment {
  id: string;
  name: string;
  code: string;
  model: string;
  category: string;
  department: string;
  labName: string;
  location: string;
  capacity: number;
  status: EquipmentStatus;
  hourlyRate: string;
  specifications: string[];
  safetyRequirements: string[];
  supervisor: string;
  fairSlotTier: 'Standard' | 'High-Demand' | 'Restricted';
  utilizationRate: number; // percentage
  imageUrl?: string;
  description: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  labName: string;
  department: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  facultySupervisor: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  projectTitle: string;
  purpose: string;
  status: BookingStatus;
  fairSlotPriorityScore: number;
  submittedAt: string;
  rejectionReason?: string;
  approvalNotes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  building: string;
  headOfDepartment: string;
  totalLabs: number;
  totalEquipment: number;
  activeBookings: number;
  utilizationRate: number;
}

export interface FairSlotRule {
  id: string;
  title: string;
  description: string;
  weight: number;
  active: boolean;
}

export interface ProjectRecommendation {
  domain: string;
  matchingEquipment: string[];
  recommendedDuration: string;
  requiredClearances: string[];
  suggestedSteps: string[];
}

// ---------------------------------------------------------------------------
// FairSlot engine types (Phase 2)
// ---------------------------------------------------------------------------

/** A student's request for a specific equipment time slot (demo data only). */
export interface SlotRequest {
  id: string;
  studentName: string;
  studentId: string;
  projectTitle: string;
  equipmentId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  projectDeadline: string; // YYYY-MM-DD
  previousUsageHours: number; // hours used on this equipment in the last 30 days
  needScore: number; // 0–100, how essential this equipment is to the project
  needJustification: string;
  submittedAt: string; // YYYY-MM-DD HH:MM
}

export interface FairSlotScore {
  urgency: number; // U
  fairness: number; // F
  need: number; // N
  priority: number; // P = 0.5U + 0.3F + 0.2N
}

export type FairSlotOutcome = 'allocated' | 'alternative' | 'waitlisted' | 'infeasible';

export interface AlternativeOption {
  type: 'equipment' | 'slot';
  equipmentId: string;
  equipmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

export interface FairSlotDecision {
  request: SlotRequest;
  score: FairSlotScore | null; // null when the request is infeasible
  rank: number | null;
  outcome: FairSlotOutcome;
  explanation: string;
  alternative?: AlternativeOption;
}
