import { Equipment, Booking, Department, FairSlotRule, SlotRequest } from '../types';

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-001',
    name: 'Field Emission Scanning Electron Microscope (FE-SEM)',
    code: 'SEM-JEOL-7800F',
    model: 'JEOL JSM-7800F Prime',
    category: 'Microscopy & Imaging',
    department: 'Materials & Nanotechnology',
    labName: 'Central Advanced Imaging Facility (Room B-104)',
    location: 'Science Complex Block B',
    capacity: 1,
    status: 'available',
    hourlyRate: 'Academic: Free (Max 6 hrs/mo)',
    specifications: [
      'Resolution: 0.7 nm at 15 kV',
      'Magnification: 25x to 1,000,000x',
      'Accelerating Voltage: 0.01 to 30 kV',
      'EDS detector for elemental microanalysis'
    ],
    safetyRequirements: [
      'Level 2 High-Vacuum Safety Clearance',
      'Sample preparation protocol certified',
      'Cleanroom booties and gloves mandatory'
    ],
    supervisor: 'Dr. Ramesh Kulkarni',
    fairSlotTier: 'High-Demand',
    utilizationRate: 91,
    description: 'High-resolution surface topology and nanoscale elemental characterization for engineering and materials research.'
  },
  {
    id: 'eq-002',
    name: '4-Axis CNC Milling Center',
    code: 'CNC-HAAS-VF2',
    model: 'Haas VF-2SS Super-Speed',
    category: 'Rapid Prototyping & Fabrication',
    department: 'Mechanical & Mechatronics Engineering',
    labName: 'Advanced Manufacturing & Automation Lab (Room M-012)',
    location: 'Engineering Workshop Block A',
    capacity: 2,
    status: 'available',
    hourlyRate: 'Academic: Free (Material charges apply)',
    specifications: [
      'Table: 914 x 356 mm',
      'Spindle Speed: 12,000 RPM inline direct-drive',
      'Accuracy: ±0.005 mm positioning repeatability',
      'Integrated Renishaw wireless intuitive probing'
    ],
    safetyRequirements: [
      'Workshop Machine Safety Training Badge',
      'ANSI Z87.1 certified eye protection',
      'G-Code simulation verification required before run'
    ],
    supervisor: 'Prof. Ananya Sen',
    fairSlotTier: 'Standard',
    utilizationRate: 74,
    description: 'Precision multi-axis component milling for aerospace prototypes, robotics chassis, and precision mechanisms.'
  },
  {
    id: 'eq-003',
    name: 'High-Performance GPU Cluster (4x NVIDIA H100)',
    code: 'HPC-NODE-AI-01',
    model: 'Supermicro SuperServer 4U HGX H100',
    category: 'High Performance Computing',
    department: 'Computer Science & Artificial Intelligence',
    labName: 'Deep Learning & Autonomous Systems Lab (Room CS-308)',
    location: 'Computing Center 3rd Floor',
    capacity: 8,
    status: 'available',
    hourlyRate: 'Academic: Compute Quota Granted per Project',
    specifications: [
      '4x NVIDIA H100 SXM5 80GB HBM3',
      'Dual AMD EPYC 9654 (192 Cores total)',
      '1.5 TB DDR5 ECC Server Memory',
      'Slurm workload manager with JupyterHub integration'
    ],
    safetyRequirements: [
      'Cybersecurity & SSH key authentication setup',
      'Compute job script memory profiling review'
    ],
    supervisor: 'Dr. Vivek Narayan',
    fairSlotTier: 'High-Demand',
    utilizationRate: 96,
    description: 'Shared accelerated compute node for large-scale neural network training, computer vision, and scientific simulations.'
  },
  {
    id: 'eq-004',
    name: 'Universal Testing Machine (100 kN UTM)',
    code: 'UTM-INST-5982',
    model: 'Instron 5982 Floor Model',
    category: 'Materials Characterization',
    department: 'Civil & Structural Engineering',
    labName: 'Structural Mechanics & Materials Testing Lab (Room C-005)',
    location: 'Heavy Structures Wing',
    capacity: 3,
    status: 'available',
    hourlyRate: 'Academic: Free',
    specifications: [
      'Load capacity: 100 kN tension / compression',
      'Video extensometer for non-contact strain measurement',
      'Temperature chamber: -100°C to +350°C',
      'Bluehill Universal material test suite'
    ],
    safetyRequirements: [
      'Impact shielding barrier operation protocol',
      'Pre-test load cell zeroing check'
    ],
    supervisor: 'Dr. Meera Nambiar',
    fairSlotTier: 'Standard',
    utilizationRate: 68,
    description: 'Tensile, compression, bend, peel, tear, shear and friction testing on polymers, metals, composites, and structural components.'
  },
  {
    id: 'eq-005',
    name: 'Autonomous Mobile Robot Test Rig (ROS 2)',
    code: 'AMR-CLEAR-JACKAL',
    model: 'Clearpath Jackal UGV Research Edition',
    category: 'Robotics & Control',
    department: 'Mechanical & Mechatronics Engineering',
    labName: 'Field Robotics & Swarm Intelligence Lab (Room M-210)',
    location: 'Innovation Pavilion Ground Floor',
    capacity: 2,
    status: 'in_use',
    hourlyRate: 'Academic: Free (Team slots: 3 hrs max)',
    specifications: [
      'Velodyne Puck 3D LiDAR (16 channels, 100m range)',
      'Intel RealSense D435i Depth Camera',
      'VectorNav VN-100 Rugged IMU / AHRS',
      'NVIDIA Jetson AGX Orin onboard processing unit'
    ],
    safetyRequirements: [
      'Hardware kill-switch inspection prior to release',
      'Designated indoor arena boundary adherence'
    ],
    supervisor: 'Prof. Ananya Sen',
    fairSlotTier: 'High-Demand',
    utilizationRate: 88,
    description: 'All-terrain mobile robot platform for SLAM development, sensor fusion experiments, and autonomous navigation research.'
  },
  {
    id: 'eq-006',
    name: 'UV-Vis-NIR Spectrophotometer',
    code: 'SPEC-SHIM-3600',
    model: 'Shimadzu SolidSpec-3700DUV',
    category: 'Spectroscopy',
    department: 'Materials & Nanotechnology',
    labName: 'Photovoltaics & Optical Characterization Lab (Room B-202)',
    location: 'Science Complex Block B',
    capacity: 2,
    status: 'available',
    hourlyRate: 'Academic: Free',
    specifications: [
      'Wavelength Range: 175 nm to 2600 nm',
      'Three detectors: PMT, InGaAs, and cooled PbS',
      'Integrating sphere attachment for powder & thin films',
      'Photometric Range: -6 to +6 Abs'
    ],
    safetyRequirements: [
      'UV emission shield awareness',
      'Solvent spill kit protocol'
    ],
    supervisor: 'Dr. Ramesh Kulkarni',
    fairSlotTier: 'Standard',
    utilizationRate: 59,
    description: 'High-sensitivity optical transmittance, reflectance, and absorbance analysis for solar cells, coatings, and nanomaterials.'
  },
  {
    id: 'eq-007',
    name: 'Real-Time Quantitative PCR System (qPCR)',
    code: 'BIO-QPCR-QS5',
    model: 'Applied Biosystems QuantStudio 5 (384-Well)',
    category: 'Biotechnology & Molecular Biology',
    department: 'Bioengineering & Medical Sciences',
    labName: 'Molecular Genetics & Diagnostics Lab (Room BIO-112)',
    location: 'Biomedical Innovation Tower',
    capacity: 2,
    status: 'available',
    hourlyRate: 'Academic: Free (Reagents supplied by researcher)',
    specifications: [
      'Optics: 6 decoupled filters, 21 combinations',
      'Block format: 384-well high throughput',
      'Sensitivity: Detects 1.5-fold changes in singleplex',
      'Cloud-enabled remote experiment monitoring'
    ],
    safetyRequirements: [
      'Biosafety Level 2 (BSL-2) certification',
      'Biohazard waste disposal protocol signoff'
    ],
    supervisor: 'Dr. Sunita Rao',
    fairSlotTier: 'Restricted',
    utilizationRate: 82,
    description: 'Accurate gene expression profiling, pathogen detection, and genetic variation analysis for biomedical applications.'
  },
  {
    id: 'eq-008',
    name: 'Multi-Layer PCB Prototyping Milling Station',
    code: 'PCB-LPKF-S104',
    model: 'LPKF ProtoMat S104',
    category: 'Rapid Prototyping & Fabrication',
    department: 'Computer Science & Artificial Intelligence',
    labName: 'Embedded Systems & Hardware IoT Lab (Room CS-118)',
    location: 'Computing Center 1st Floor',
    capacity: 1,
    status: 'maintenance',
    hourlyRate: 'Academic: Free (Copper boards provided)',
    specifications: [
      'Spindle Speed: 100,000 RPM high frequency',
      'Minimum track width / insulation: 100 µm / 0.1 mm',
      '20-position automatic tool changer',
      'Optical fiducial recognition system'
    ],
    safetyRequirements: [
      'Acoustic hood interlock safety',
      'Fine particulate exhaust check'
    ],
    supervisor: 'Dr. Vivek Narayan',
    fairSlotTier: 'Standard',
    utilizationRate: 64,
    description: 'Chemical-free mechanical routing and drilling for multi-layer rapid prototype printed circuit boards.'
  },
  {
    // DEMO ITEM — added to showcase the Alternative Equipment Finder.
    id: 'eq-009',
    name: '3-Axis Desktop CNC Router (Demo)',
    code: 'CNC-DESK-DEMO',
    model: 'Generic desktop CNC router (demo data)',
    category: 'Rapid Prototyping & Fabrication',
    department: 'Electronics & Communication Engineering',
    labName: 'Maker Space (Demo Lab E-01)',
    location: 'Demo Block E Ground Floor',
    capacity: 1,
    status: 'available',
    hourlyRate: 'Academic: Free (demo)',
    specifications: [
      'Work area: 300 x 180 mm',
      'Spindle: 10,000 RPM',
      'Suitable for aluminium, acrylic and wood prototypes'
    ],
    safetyRequirements: ['Workshop Machine Safety Training Badge', 'Eye protection mandatory'],
    supervisor: 'Demo Faculty Supervisor',
    fairSlotTier: 'Standard',
    utilizationRate: 35,
    description: 'Smaller CNC router that can substitute for the 4-Axis CNC on simple prototype parts.'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-2026-081',
    equipmentId: 'eq-001',
    equipmentName: 'Field Emission Scanning Electron Microscope (FE-SEM)',
    labName: 'Central Advanced Imaging Facility (Room B-104)',
    department: 'Materials & Nanotechnology',
    studentName: 'Sarah Chen',
    studentId: 'STU-2023-ME-409',
    studentEmail: 'sarah.chen@university.edu',
    facultySupervisor: 'Dr. Ramesh Kulkarni',
    date: '2026-11-26',
    timeSlot: '09:00 - 12:00',
    durationHours: 3,
    projectTitle: 'Nanoscale Fracture Analysis in 3D-Printed Titanium Alloys',
    purpose: 'Investigating void coalescence under cyclic mechanical fatigue for aerospace bracket prototyping.',
    status: 'approved',
    fairSlotPriorityScore: 92,
    submittedAt: '2026-11-21 14:15',
    approvalNotes: 'Approved. Ensure specimen is vacuum-degassed 24h prior.'
  },
  {
    id: 'bk-2026-082',
    equipmentId: 'eq-003',
    equipmentName: 'High-Performance GPU Cluster (4x NVIDIA H100)',
    labName: 'Deep Learning & Autonomous Systems Lab (Room CS-308)',
    department: 'Computer Science & Artificial Intelligence',
    studentName: 'Sarah Chen',
    studentId: 'STU-2023-ME-409',
    studentEmail: 'sarah.chen@university.edu',
    facultySupervisor: 'Dr. Vivek Narayan',
    date: '2026-11-27',
    timeSlot: '14:00 - 18:00',
    durationHours: 4,
    projectTitle: 'Real-time Defect Detection Vision Transformer',
    purpose: 'Training fine-tuned Swin Transformer models on high-res SEM dataset.',
    status: 'pending',
    fairSlotPriorityScore: 84,
    submittedAt: '2026-11-22 10:30'
  },
  {
    id: 'bk-2026-083',
    equipmentId: 'eq-002',
    equipmentName: '4-Axis CNC Milling Center',
    labName: 'Advanced Manufacturing & Automation Lab (Room M-012)',
    department: 'Mechanical & Mechatronics Engineering',
    studentName: 'Aarav Patel',
    studentId: 'STU-2023-ME-312',
    studentEmail: 'aarav.patel@university.edu',
    facultySupervisor: 'Prof. Ananya Sen',
    date: '2026-11-25',
    timeSlot: '10:00 - 13:00',
    durationHours: 3,
    projectTitle: 'High-Efficiency Impeller Machining for Micro Gas Turbines',
    purpose: 'Final year capstone prototype machining using 6061-T6 aluminum block.',
    status: 'pending',
    fairSlotPriorityScore: 89,
    submittedAt: '2026-11-22 16:45'
  },
  {
    id: 'bk-2026-084',
    equipmentId: 'eq-005',
    equipmentName: 'Autonomous Mobile Robot Test Rig (ROS 2)',
    labName: 'Field Robotics & Swarm Intelligence Lab (Room M-210)',
    department: 'Mechanical & Mechatronics Engineering',
    studentName: 'Devika Sharma',
    studentId: 'STU-2024-AI-105',
    studentEmail: 'devika.sharma@university.edu',
    facultySupervisor: 'Prof. Ananya Sen',
    date: '2026-11-24',
    timeSlot: '13:00 - 16:00',
    durationHours: 3,
    projectTitle: '3D LiDAR-Inertial Odometry in GPS-Denied Environments',
    purpose: 'Autonomous corridor navigation benchmark comparing FAST-LIO and LIO-SAM algorithms.',
    status: 'approved',
    fairSlotPriorityScore: 94,
    submittedAt: '2026-11-20 09:10',
    approvalNotes: 'Approved. Check safety kill-switch cord before enabling teleop.'
  },
  {
    id: 'bk-2026-085',
    equipmentId: 'eq-007',
    equipmentName: 'Real-Time Quantitative PCR System (qPCR)',
    labName: 'Molecular Genetics & Diagnostics Lab (Room BIO-112)',
    department: 'Bioengineering & Medical Sciences',
    studentName: 'Karthik Raja',
    studentId: 'STU-2022-BIO-054',
    studentEmail: 'karthik.raja@university.edu',
    facultySupervisor: 'Dr. Sunita Rao',
    date: '2026-11-24',
    timeSlot: '09:00 - 12:00',
    durationHours: 3,
    projectTitle: 'MicroRNA Biomarker Expression in Cardiac Tissue',
    purpose: 'Quantifying fold-change in miR-21 expression using TaqMan assays.',
    status: 'pending',
    fairSlotPriorityScore: 78,
    submittedAt: '2026-11-23 08:20'
  },
  {
    id: 'bk-2026-086',
    equipmentId: 'eq-004',
    equipmentName: 'Universal Testing Machine (100 kN UTM)',
    labName: 'Structural Mechanics & Materials Testing Lab (Room C-005)',
    department: 'Civil & Structural Engineering',
    studentName: 'Sarah Chen',
    studentId: 'STU-2023-ME-409',
    studentEmail: 'sarah.chen@university.edu',
    facultySupervisor: 'Dr. Meera Nambiar',
    date: '2026-11-18',
    timeSlot: '14:00 - 17:00',
    durationHours: 3,
    projectTitle: 'Tensile Stress-Strain Characterization of Bio-Resin Composites',
    purpose: 'ASTM D638 standard coupon tensile test across 5 batches.',
    status: 'completed',
    fairSlotPriorityScore: 88,
    submittedAt: '2026-11-14 11:00',
    approvalNotes: 'Completed on schedule. Equipment returned clean and calibrated.'
  },
  {
    id: 'bk-2026-087',
    equipmentId: 'eq-001',
    equipmentName: 'Field Emission Scanning Electron Microscope (FE-SEM)',
    labName: 'Central Advanced Imaging Facility (Room B-104)',
    department: 'Materials & Nanotechnology',
    studentName: 'Vikram Sundaram',
    studentId: 'STU-2024-PHY-019',
    studentEmail: 'vikram.s@university.edu',
    facultySupervisor: 'Dr. Ramesh Kulkarni',
    date: '2026-11-19',
    timeSlot: '10:00 - 12:00',
    durationHours: 2,
    projectTitle: 'Perovskite Thin-Film Grain Boundary Inspection',
    purpose: 'Imaging crystallization defects under thermal degradation.',
    status: 'rejected',
    fairSlotPriorityScore: 61,
    submittedAt: '2026-11-16 15:40',
    rejectionReason: 'Missing prerequisite Level-2 High-Vacuum safety certificate. Please complete orientation first.'
  }
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-eng',
    name: 'Mechanical & Mechatronics Engineering',
    code: 'ME-MTR',
    building: 'Engineering Block A & B',
    headOfDepartment: 'Prof. Ananya Sen',
    totalLabs: 6,
    totalEquipment: 18,
    activeBookings: 42,
    utilizationRate: 78
  },
  {
    id: 'dept-cs',
    name: 'Computer Science & Artificial Intelligence',
    code: 'CS-AI',
    building: 'Computing Center & Tech Tower',
    headOfDepartment: 'Dr. Vivek Narayan',
    totalLabs: 5,
    totalEquipment: 14,
    activeBookings: 67,
    utilizationRate: 92
  },
  {
    id: 'dept-mat',
    name: 'Materials & Nanotechnology',
    code: 'MNT',
    building: 'Science Complex Block B',
    headOfDepartment: 'Dr. Ramesh Kulkarni',
    totalLabs: 4,
    totalEquipment: 11,
    activeBookings: 29,
    utilizationRate: 81
  },
  {
    id: 'dept-bio',
    name: 'Bioengineering & Medical Sciences',
    code: 'BIO-MED',
    building: 'Biomedical Innovation Tower',
    headOfDepartment: 'Dr. Sunita Rao',
    totalLabs: 3,
    totalEquipment: 8,
    activeBookings: 19,
    utilizationRate: 71
  }
];

export const FAIRSLOT_RULES: FairSlotRule[] = [
  {
    id: 'fs-1',
    title: 'Interdisciplinary Department Quota Protection',
    description: 'Guarantees at least 25% of high-demand instrument slots are reserved for cross-departmental researchers.',
    weight: 35,
    active: true
  },
  {
    id: 'fs-2',
    title: 'Thesis & Capstone Milestone Priority',
    description: 'Boosts priority score for students within 60 days of official project submission deadlines.',
    weight: 30,
    active: true
  },
  {
    id: 'fs-3',
    title: 'Monopoly Prevention & Fair Rotation',
    description: 'Dampens booking score if the same research group booked the instrument in the preceding 7 days.',
    weight: 20,
    active: true
  },
  {
    id: 'fs-4',
    title: 'Lab Etiquette & Punctuality Reliability Score',
    description: 'Rewards researchers who complete sessions on time and leave lab equipment in certified clean condition.',
    weight: 15,
    active: true
  }
];

export const PROJECT_DOMAINS = [
  {
    id: 'robotics',
    label: 'Robotics, Drones & Autonomous Systems',
    keywords: ['ros', 'slam', 'lidar', 'drone', 'motor', 'actuator', 'chassis', 'kinematics'],
    matchedEquipmentIds: ['eq-002', 'eq-005', 'eq-008'],
    suggestedDuration: '4 to 6 weeks',
    safetyClearances: ['Mechanical Workshop Safety', 'Lithium Battery Handling Protocol'],
    suggestedSteps: [
      'Cad structural chassis in Fusion 360 / SolidWorks',
      'Mill lightweight chassis on 4-Axis CNC Milling Center',
      'Integrate onboard avionics / ROS2 nodes on Autonomous Mobile Robot Test Rig',
      'Conduct controlled indoor arena testing with LiDAR odometry'
    ]
  },
  {
    id: 'ai-vision',
    label: 'Machine Learning, Deep Learning & Computer Vision',
    keywords: ['gpu', 'neural network', 'transformer', 'vision', 'llm', 'training', 'dataset', 'cuda'],
    matchedEquipmentIds: ['eq-003', 'eq-008'],
    suggestedDuration: '3 to 5 weeks',
    safetyClearances: ['HPC Node Security & Job Scheduling Clearance'],
    suggestedSteps: [
      'Profile dataset distribution and prepare preprocessing pipelines',
      'Submit batch SLURM training scripts on 4x NVIDIA H100 GPU Cluster',
      'Quantize and prune weights for embedded edge deployment',
      'Prototype IoT interface board on PCB Prototyping Station'
    ]
  },
  {
    id: 'nanomaterials',
    label: 'Nanotechnology, Metallurgy & Advanced Materials',
    keywords: ['sem', 'microscopy', 'nanotube', 'spectroscopy', 'tensile', 'fatigue', 'thin film', 'composite'],
    matchedEquipmentIds: ['eq-001', 'eq-004', 'eq-006'],
    suggestedDuration: '6 to 8 weeks',
    safetyClearances: ['Level 2 High-Vacuum Safety Clearance', 'Chemical Solvent & Spill Protocol'],
    suggestedSteps: [
      'Fabricate test coupons under controlled thermal conditions',
      'Perform optical absorption/bandgap test on UV-Vis Spectrophotometer',
      'Conduct mechanical tensile/fatigue test on 100 kN Universal Testing Machine',
      'Examine fracture surfaces and grain boundaries on FE-SEM'
    ]
  },
  {
    id: 'biotech',
    label: 'Bioengineering, Biomaterials & Diagnostics',
    keywords: ['pcr', 'qpcr', 'gene', 'dna', 'rna', 'tissue', 'bio', 'diagnostics', 'cell'],
    matchedEquipmentIds: ['eq-007', 'eq-001', 'eq-006'],
    suggestedDuration: '4 to 7 weeks',
    safetyClearances: ['Biosafety Level 2 (BSL-2) Certification', 'Biohazard Disposal Protocol'],
    suggestedSteps: [
      'Isolate and purify target genetic material / specimen',
      'Perform quantitative real-time PCR amplification on QuantStudio 5',
      'Validate absorbance ratios on UV-Vis Spectrophotometer',
      'Prepare detailed comparative expression report for faculty review'
    ]
  }
];

/**
 * DEMO DATA — competing requests used to demonstrate FairSlot.
 * Scenario: 4 students want the 4-Axis CNC (capacity 2) on 2026-11-28, 10:00–13:00,
 * plus two requests that are infeasible as submitted.
 */
export const DEMO_SLOT_REQUESTS: SlotRequest[] = [
  {
    id: 'req-101',
    studentName: 'Aarav Patel',
    studentId: 'STU-2023-ME-312',
    projectTitle: 'Micro Gas Turbine Impeller (Capstone)',
    equipmentId: 'eq-002',
    date: '2026-11-28',
    startTime: '10:00',
    endTime: '13:00',
    projectDeadline: '2026-11-30',
    previousUsageHours: 12,
    needScore: 90,
    needJustification: 'Impeller geometry needs 4-axis machining; no manual alternative.',
    submittedAt: '2026-11-23 09:10'
  },
  {
    id: 'req-102',
    studentName: 'Riya Nair',
    studentId: 'STU-2024-ME-221',
    projectTitle: 'Low-Cost Prosthetic Hand Joints',
    equipmentId: 'eq-002',
    date: '2026-11-28',
    startTime: '10:00',
    endTime: '13:00',
    projectDeadline: '2026-12-20',
    previousUsageHours: 0,
    needScore: 70,
    needJustification: 'Precision aluminium joints for first working prototype.',
    submittedAt: '2026-11-23 09:40'
  },
  {
    id: 'req-103',
    studentName: 'Rohan Das',
    studentId: 'STU-2023-MT-118',
    projectTitle: 'Line-Following Robot Chassis',
    equipmentId: 'eq-002',
    date: '2026-11-28',
    startTime: '10:00',
    endTime: '13:00',
    projectDeadline: '2026-12-05',
    previousUsageHours: 18,
    needScore: 60,
    needJustification: 'Flat chassis plate; simpler machine may be acceptable.',
    submittedAt: '2026-11-23 10:05'
  },
  {
    id: 'req-104',
    studentName: 'Neha Iyer',
    studentId: 'STU-2025-ME-030',
    projectTitle: 'Desk Organiser Design Exercise',
    equipmentId: 'eq-002',
    date: '2026-11-28',
    startTime: '10:00',
    endTime: '13:00',
    projectDeadline: '2027-01-25',
    previousUsageHours: 2,
    needScore: 50,
    needJustification: 'Course exercise; flexible on timing.',
    submittedAt: '2026-11-23 11:30'
  },
  {
    id: 'req-105',
    studentName: 'Kabir Menon',
    studentId: 'STU-2024-EC-077',
    projectTitle: 'IoT Sensor Enclosure',
    equipmentId: 'eq-008',
    date: '2026-11-28',
    startTime: '14:00',
    endTime: '16:00',
    projectDeadline: '2026-12-10',
    previousUsageHours: 1,
    needScore: 65,
    needJustification: 'Needs milling for enclosure mounting plate.',
    submittedAt: '2026-11-23 12:00'
  },
  {
    id: 'req-106',
    studentName: 'Ishaan Gupta',
    studentId: 'STU-2023-CS-402',
    projectTitle: 'Drone Frame Prototype',
    equipmentId: 'eq-002',
    date: '2026-12-02',
    startTime: '11:00',
    endTime: '12:00',
    projectDeadline: '2026-11-30',
    previousUsageHours: 4,
    needScore: 80,
    needJustification: 'Carbon plate frame cutting.',
    submittedAt: '2026-11-23 12:15'
  }
];
