# Lab Link PRD v3.0 - Modular Lab Operating System

Date: 2026-05-19
Status: Implementation spec
Completion promise: `LABLINK_V3_PRODUCTION_READY`

## 1. Product Vision

Transform LabLink from a functional beta into a production-grade modular lab operating system. The rebuild addresses critical UX issues (freezing AI, poor visual design, lack of modularity) while adding comprehensive lab features through a context-aware plugin architecture.

The v3 platform must feel modern, responsive, and customizable while maintaining the zero-dependency bootstrap philosophy that makes npm installation reliable.

## 2. Critical Problems Solved

### 2.1 Freezing AI Interactions
**Problem:** All AI actions (Organize, Meeting Analysis, Section Proposal) freeze the entire UI with no feedback.

**Solution:** Server-Sent Events streaming with proper loading states, cancellation support, and progressive reveal.

### 2.2 Poor Visual Design
**Problem:** Interface feels dated, cluttered, and amateurish. Typography, spacing, colors, and animations lack polish.

**Solution:** Professional design system with modern color palette, consistent spacing scale, smooth animations, and attention to visual hierarchy.

### 2.3 Lack of True Modularity
**Problem:** Features are tightly coupled, blocks aren't reusable, and lab-specific workflows can't be added without core changes.

**Solution:** Web Component-based plugin architecture with formal manifests, capability contracts, and context-aware visibility.

### 2.4 Feature Clutter
**Problem:** Showing all blocks to all labs creates visual noise when most features are irrelevant.

**Solution:** Context-aware block discovery that shows features only when relevant data exists, with clear setup paths for new capabilities.

### 2.5 Missing Lab Features
**Problem:** Critical lab workflows (equipment, samples, grants, team coordination, safety) are absent or rudimentary.

**Solution:** Comprehensive lab blocks implemented as contextual plugins with domain-specific UX.

## 3. Technical Architecture

### 3.1 Component System

**Web Components as Plugin Foundation:**
- Native browser support (zero dependencies)
- True encapsulation with Shadow DOM
- Custom element registry for block discovery
- Lifecycle hooks for mount/unmount optimization

**Base Component Hierarchy:**
```
lab-block (abstract base)
├── lab-priority-queue
├── lab-experiment-readiness
├── lab-meeting-studio
├── lab-reagent-watch
├── lab-equipment-tracker
├── lab-sample-pipeline
├── lab-grant-milestones
├── lab-team-coordination
├── lab-data-pipeline
├── lab-safety-checklist
├── lab-risk-radar
├── lab-calendar-pressure
├── lab-integration-routes
├── lab-ai-review
├── lab-inbox-signals
├── lab-project-health
└── lab-custom-sections

lab-workspace (container)
├── lab-topbar
├── lab-command-composer
├── lab-block-grid
└── lab-inspector-panel
```

**Component Communication:**
- Custom events bubble up for user actions
- Global event bus for cross-block coordination
- LocalStorage events for multi-tab sync
- Pub/sub pattern for data updates

### 3.2 Block Plugin Manifest

Each block registers with a formal manifest:

```javascript
{
  id: 'equipment-tracker',
  version: '1.0.0',
  title: 'Equipment Tracker',
  description: 'Track equipment status, maintenance, calibration, and bookings',
  domain: 'Operations',
  category: 'lab-management',

  // Capabilities this block provides
  capabilities: ['equipment-list', 'maintenance-schedule', 'booking-system'],

  // Data dependencies required for this block to function
  dataDependencies: ['equipment', 'maintenance-logs'],

  // Context rules - when should this block appear?
  contextTriggers: {
    hasEquipment: () => state.data.equipment.length > 0,
    equipmentModuleEnabled: () => state.featureFlags.equipment === true
  },

  // Layout preferences
  size: { default: 'large', min: 'medium', max: 'xlarge' },

  // Subtabs within this block
  subtabs: [
    { id: 'list', label: 'Equipment', icon: 'wrench' },
    { id: 'maintenance', label: 'Maintenance', icon: 'calendar' },
    { id: 'bookings', label: 'Bookings', icon: 'clock' }
  ],

  // Actions this block exposes
  actions: [
    { id: 'add-equipment', label: 'Add Equipment', primary: true },
    { id: 'schedule-maintenance', label: 'Schedule Maintenance' },
    { id: 'book-equipment', label: 'Book Equipment' }
  ],

  // The Web Component tag name
  component: 'lab-equipment-tracker',

  // Setup guidance when block is available but hidden
  setup: {
    title: 'Enable Equipment Tracking',
    description: 'Track equipment status, maintenance schedules, and bookings',
    steps: [
      'Import your equipment list (CSV or manual entry)',
      'Set up maintenance schedules',
      'Configure booking rules'
    ],
    estimatedTime: '10 minutes'
  }
}
```

### 3.3 Streaming AI Architecture

**Current State:** Synchronous fetch calls block UI.

**New Architecture:**

**Backend Endpoints:**
```
POST /api/ai/organize/stream
POST /api/ai/meeting/analyze/stream
POST /api/ai/builder/propose/stream
POST /api/ai/insight/generate/stream
```

**Response Format (Server-Sent Events):**
```
event: start
data: {"id":"org-123","timestamp":1234567890}

event: token
data: {"token":"Priority","type":"text"}

event: token
data: {"token":" Queue","type":"text"}

event: progress
data: {"progress":0.3,"message":"Analyzing blocks..."}

event: result
data: {"visibleBlocks":["priority-queue","meeting-studio"],...}

event: complete
data: {"id":"org-123","duration":2341}
```

**Frontend Streaming Handler:**
```javascript
class StreamingAIService {
  async streamOrganize(intent, onToken, onProgress, onComplete, onError) {
    const eventSource = new EventSource('/api/ai/organize/stream?intent=' + intent);

    eventSource.addEventListener('token', (e) => {
      const data = JSON.parse(e.data);
      onToken(data.token);
    });

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      onProgress(data.progress, data.message);
    });

    eventSource.addEventListener('result', (e) => {
      const data = JSON.parse(e.data);
      onComplete(data);
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      onError(e);
      eventSource.close();
    });

    return () => eventSource.close(); // Cancellation function
  }
}
```

**Loading State Machine:**
```
idle → connecting → streaming → [complete | error | cancelled]
```

**UI States:**
- **idle:** Button ready, no visual feedback
- **connecting:** "Thinking..." with pulsing animation (0-500ms)
- **streaming:** Progressive reveal with typing effect, block skeletons
- **complete:** Smooth transition to final state
- **error:** Clear error message with retry action
- **cancelled:** Instant return to idle

**Performance Targets:**
- Connection establishment: < 100ms
- First token: < 500ms
- Token display: 60fps smooth
- Cancellation response: < 50ms

### 3.4 Design System

**Color Palette:**
```css
:root {
  /* Primary (Lab Blue) */
  --color-primary-50: hsl(210, 100%, 97%);
  --color-primary-100: hsl(210, 95%, 92%);
  --color-primary-200: hsl(210, 95%, 85%);
  --color-primary-300: hsl(210, 95%, 75%);
  --color-primary-400: hsl(210, 95%, 65%);
  --color-primary-500: hsl(210, 95%, 50%);
  --color-primary-600: hsl(210, 90%, 45%);
  --color-primary-700: hsl(210, 85%, 38%);
  --color-primary-800: hsl(210, 82%, 30%);
  --color-primary-900: hsl(210, 80%, 20%);

  /* Neutral */
  --color-neutral-50: hsl(220, 20%, 98%);
  --color-neutral-100: hsl(220, 15%, 95%);
  --color-neutral-200: hsl(220, 13%, 90%);
  --color-neutral-300: hsl(220, 12%, 80%);
  --color-neutral-400: hsl(220, 10%, 65%);
  --color-neutral-500: hsl(220, 10%, 50%);
  --color-neutral-600: hsl(220, 12%, 40%);
  --color-neutral-700: hsl(220, 15%, 30%);
  --color-neutral-800: hsl(220, 18%, 20%);
  --color-neutral-900: hsl(220, 20%, 15%);

  /* Semantic */
  --color-success-500: hsl(145, 60%, 45%);
  --color-success-600: hsl(145, 65%, 38%);
  --color-warning-500: hsl(35, 90%, 55%);
  --color-warning-600: hsl(35, 92%, 48%);
  --color-error-500: hsl(0, 70%, 55%);
  --color-error-600: hsl(0, 75%, 48%);

  /* Surfaces */
  --surface-bg: hsl(220, 15%, 99%);
  --surface-elevated: hsl(0, 0%, 100%);
  --surface-interactive: var(--color-primary-50);
  --surface-hover: var(--color-neutral-100);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
  --font-mono: "SF Mono", Consolas, "Courier New", monospace;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 48px;

  /* Animation */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Typography System:**
- **Display:** 48px/56px, weight 700, tight tracking
- **Heading 1:** 32px/40px, weight 600
- **Heading 2:** 24px/32px, weight 600
- **Heading 3:** 20px/28px, weight 600
- **Body Large:** 18px/28px, weight 400
- **Body:** 16px/24px, weight 400
- **Body Small:** 14px/20px, weight 400
- **Caption:** 12px/16px, weight 500, uppercase tracking

**Animation Principles:**
- **Entrance:** ease-out, 250ms (blocks feel responsive)
- **Exit:** ease-in, 150ms (quick removal)
- **Movement:** ease-in-out, 250ms (smooth repositioning)
- **Stagger:** 50ms delay between block animations
- **Micro-interactions:** 150ms (button hover, toggle)

### 3.5 Context-Aware Block Discovery

**Problem:** Too many empty blocks clutter the interface.

**Solution:** Smart visibility based on data presence and feature flags.

**Visibility Rules:**
```javascript
const blockVisibility = {
  'priority-queue': {
    alwaysVisible: true,
    reason: 'Core execution surface'
  },

  'experiment-readiness': {
    condition: () => state.data.experiments.length > 0,
    setupGuidance: 'Import experiments to enable this block'
  },

  'reagent-watch': {
    condition: () => state.data.inventory.length > 0 || state.featureFlags.inventory,
    setupGuidance: 'Add reagents to track inventory'
  },

  'equipment-tracker': {
    condition: () => state.data.equipment.length > 0,
    setupGuidance: 'Import equipment list to enable tracking'
  },

  'grant-milestones': {
    condition: () => state.data.grants.length > 0,
    setupGuidance: 'Add grants to track milestones and deadlines'
  },

  'team-coordination': {
    condition: () => state.data.team.length > 1,
    setupGuidance: 'Multi-user mode required'
  },

  'data-pipeline': {
    condition: () => state.labType === 'computational' || state.data.pipelines.length > 0,
    setupGuidance: 'Configure computational workflows'
  },

  'meeting-studio': {
    condition: () => state.data.meetings.length > 0,
    setupGuidance: 'Import or schedule meetings'
  },

  'custom-sections': {
    alwaysVisible: true,
    reason: 'Always available in Build workspace'
  }
};
```

**Discovery UI:**
- Inspector panel shows "Available Blocks" section
- Each hidden block shows setup guidance
- One-click "Enable" opens setup wizard
- Setup wizard imports data or enables feature flag
- Block appears automatically when condition met

## 4. Core Lab Features

### 4.1 Equipment Tracker Block

**Purpose:** Manage lab equipment lifecycle, maintenance, calibration, and bookings.

**Data Model:**
```javascript
{
  id: 'eq-uuid',
  name: 'PCR Thermocycler',
  category: 'molecular-biology',
  manufacturer: 'Applied Biosystems',
  model: 'Veriti',
  serialNumber: 'AB12345',
  location: 'Bench 3',
  status: 'operational' | 'maintenance' | 'calibration' | 'down',
  purchaseDate: '2023-01-15',
  warrantyExpiry: '2026-01-15',
  maintenanceSchedule: {
    frequency: 'quarterly',
    lastService: '2024-02-15',
    nextService: '2024-05-15'
  },
  calibration: {
    required: true,
    frequency: 'annual',
    lastCalibration: '2024-01-10',
    nextCalibration: '2025-01-10',
    certificationBody: 'NIST'
  },
  bookings: [...],
  usageLogs: [...],
  manuals: [...],
  contacts: {
    support: 'support@appliedbiosystems.com',
    technician: 'John Doe'
  }
}
```

**Subtabs:**
- **Equipment List:** Sortable table with status indicators
- **Maintenance:** Calendar view of scheduled maintenance
- **Bookings:** Booking calendar with conflict detection
- **Reports:** Usage statistics, downtime analysis

**Actions:**
- Add equipment (manual or CSV import)
- Schedule maintenance
- Book equipment
- Log usage
- Mark as down/operational
- View maintenance history

**Notifications:**
- Upcoming maintenance (7 days before)
- Calibration due (30 days before)
- Equipment down (immediate)
- Booking conflicts (immediate)

### 4.2 Sample Pipeline Block

**Purpose:** Track biological samples through processing stages, QC checkpoints, and storage.

**Data Model:**
```javascript
{
  id: 'sample-uuid',
  cohort: 'Study-A-2024',
  sampleId: 'SA-001',
  type: 'blood' | 'tissue' | 'cell-line' | 'dna' | 'rna' | 'protein',
  source: {
    subject: 'Patient-001',
    collectionDate: '2024-03-15',
    collectedBy: 'Jane Doe'
  },
  status: 'collected' | 'processing' | 'qc-pending' | 'qc-passed' | 'qc-failed' | 'stored' | 'depleted',
  pipeline: {
    currentStage: 'rna-extraction',
    stages: [
      { id: 'collection', completedAt: '2024-03-15', completedBy: 'Jane Doe' },
      { id: 'rna-extraction', startedAt: '2024-03-16', assignedTo: 'John Smith' }
    ]
  },
  qc: {
    concentration: { value: 250, unit: 'ng/uL', passThreshold: 100 },
    purity: { ratio260_280: 1.95, passThreshold: 1.8 },
    integrity: { rin: 8.5, passThreshold: 7.0 },
    status: 'passed'
  },
  storage: {
    location: 'Freezer-A-Rack-3-Box-2-Position-A1',
    temperature: -80,
    aliquots: 4,
    volume: { value: 50, unit: 'uL' }
  },
  metadata: {...}
}
```

**Subtabs:**
- **Cohorts:** Sample groups with batch statistics
- **Pipeline:** Kanban view of processing stages
- **QC:** Quality control dashboard with pass/fail stats
- **Storage:** Freezer map visualization

**Actions:**
- Register new samples
- Advance pipeline stage
- Record QC results
- Update storage location
- Generate batch reports
- Export sample manifest

**Visualizations:**
- Pipeline progress (percentage complete per cohort)
- QC metrics over time
- Freezer space utilization
- Sample depletion tracking

### 4.3 Grant Milestones Block

**Purpose:** Track grant deliverables, budgets, and deadlines.

**Data Model:**
```javascript
{
  id: 'grant-uuid',
  title: 'NIH R01 - Gene Therapy Study',
  agency: 'NIH',
  grantNumber: 'R01-GM123456',
  pi: 'Dr. Jane Smith',
  startDate: '2023-07-01',
  endDate: '2026-06-30',
  totalBudget: 1500000,
  milestones: [
    {
      id: 'ms-1',
      title: 'Complete patient recruitment',
      deadline: '2024-06-30',
      status: 'completed' | 'on-track' | 'at-risk' | 'delayed',
      deliverables: [
        { description: 'Recruitment report', dueDate: '2024-07-15', status: 'completed' }
      ],
      budget: {
        allocated: 200000,
        spent: 185000,
        remaining: 15000
      }
    }
  ],
  reports: [
    { type: 'progress', dueDate: '2024-01-15', status: 'submitted' },
    { type: 'financial', dueDate: '2024-01-31', status: 'pending' }
  ],
  publications: [...]
}
```

**Subtabs:**
- **Timeline:** Gantt chart of milestones
- **Budget:** Spending vs allocated by milestone
- **Deliverables:** Upcoming deliverables with status
- **Reports:** Grant reporting calendar

**Actions:**
- Add milestone
- Update milestone status
- Track spending
- Schedule reports
- Link publications
- Generate progress summary

**Alerts:**
- Milestone at risk (< 30 days to deadline, not on track)
- Budget overrun (spending > 90% allocated)
- Report due soon (7 days before)
- Deadline missed (immediate)

### 4.4 Team Coordination Block

**Purpose:** Coordinate lab members, track who's working on what, manage handoffs.

**Data Model:**
```javascript
{
  id: 'member-uuid',
  name: 'John Smith',
  role: 'postdoc' | 'grad-student' | 'research-tech' | 'pi' | 'lab-manager',
  status: 'active' | 'away' | 'sabbatical' | 'departed',
  availability: {
    schedule: 'full-time' | 'part-time' | 'rotating',
    hoursPerWeek: 40,
    daysInLab: ['mon', 'tue', 'wed', 'thu', 'fri']
  },
  currentWork: [
    { project: 'Project-A', experiment: 'Exp-123', priority: 'high' },
    { project: 'Project-B', experiment: 'Exp-456', priority: 'medium' }
  ],
  skills: ['molecular-biology', 'flow-cytometry', 'microscopy'],
  training: [
    { name: 'Biosafety Level 2', expiry: '2025-06-01', status: 'current' },
    { name: 'Animal Handling', expiry: '2024-12-01', status: 'expiring-soon' }
  ],
  handoffs: [
    {
      from: 'John Smith',
      to: 'Jane Doe',
      item: 'Cell culture maintenance',
      date: '2024-03-20',
      notes: 'Passage every 3 days, check confluence',
      status: 'pending' | 'acknowledged' | 'complete'
    }
  ]
}
```

**Subtabs:**
- **Team:** List with status and current work
- **Schedule:** Weekly rotation calendar
- **Skills:** Skill matrix for task assignment
- **Handoffs:** Pending handoffs requiring acknowledgment

**Actions:**
- Update availability
- Assign work
- Create handoff
- Acknowledge handoff
- Update training status
- View team capacity

**Notifications:**
- Handoff assigned (immediate)
- Training expiring (30 days before)
- Capacity overload (assigned work > available hours)

### 4.5 Data Pipeline Block

**Purpose:** Monitor computational workflows, analysis jobs, and results.

**Data Model:**
```javascript
{
  id: 'pipeline-uuid',
  name: 'RNA-seq Differential Expression',
  type: 'analysis' | 'preprocessing' | 'qc' | 'visualization',
  workflow: {
    engine: 'nextflow' | 'snakemake' | 'airflow' | 'custom',
    repository: 'https://github.com/lab/rnaseq-pipeline',
    version: 'v2.1.0'
  },
  runs: [
    {
      id: 'run-uuid',
      startedAt: '2024-03-15T10:00:00Z',
      status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled',
      progress: 0.65,
      currentStep: 'alignment',
      steps: [
        { name: 'fastqc', status: 'completed', duration: 120 },
        { name: 'trimming', status: 'completed', duration: 300 },
        { name: 'alignment', status: 'running', startedAt: '2024-03-15T10:45:00Z' }
      ],
      compute: {
        cluster: 'HPC-Cluster-1',
        nodes: 4,
        cpus: 64,
        memory: '256GB',
        walltime: '24:00:00'
      },
      results: {
        outputDir: '/data/results/run-123',
        files: [...]
      }
    }
  ],
  queue: [...]
}
```

**Subtabs:**
- **Active:** Currently running jobs with progress
- **Queue:** Pending jobs with priority
- **Results:** Completed runs with output links
- **Monitoring:** Resource usage, errors, logs

**Actions:**
- Submit new run
- Monitor progress
- View logs
- Cancel run
- Download results
- Retry failed run

**Visualizations:**
- Job progress bars
- Queue depth over time
- Resource utilization
- Success/failure rates

### 4.6 Safety Checklist Block

**Purpose:** Track lab safety protocols, compliance, incident reporting.

**Data Model:**
```javascript
{
  id: 'safety-uuid',
  type: 'protocol' | 'training' | 'incident' | 'inspection' | 'certification',
  protocol: {
    name: 'Biosafety Level 2 Procedures',
    category: 'biosafety',
    lastReview: '2024-01-15',
    nextReview: '2025-01-15',
    checklist: [
      { item: 'PPE donned correctly', required: true, frequency: 'always' },
      { item: 'BSC decontaminated', required: true, frequency: 'daily' }
    ],
    responsible: 'Lab Safety Officer'
  },
  training: {
    name: 'Chemical Safety Training',
    requiredFor: ['all-staff'],
    validityPeriod: 'annual',
    nextDue: '2024-08-01',
    enrollmentUrl: 'https://ehs.university.edu/training/chem-101'
  },
  incident: {
    date: '2024-03-10',
    type: 'chemical-spill' | 'injury' | 'equipment-failure' | 'near-miss',
    severity: 'minor' | 'moderate' | 'major',
    description: 'Small acetone spill on bench',
    immediateActions: 'Area evacuated, spill contained with absorbent',
    reporter: 'John Smith',
    status: 'reported' | 'investigating' | 'resolved',
    followUp: [...]
  }
}
```

**Subtabs:**
- **Protocols:** Active safety protocols with review dates
- **Training:** Required training status by person
- **Incidents:** Incident log with follow-up tracking
- **Inspections:** Scheduled inspections and results

**Actions:**
- Log incident
- Schedule training
- Review protocol
- Request inspection
- Generate compliance report

**Alerts:**
- Training expiring (30 days)
- Protocol review due (14 days)
- Inspection scheduled (7 days)
- Incident requires follow-up

### 4.7 Risk Radar Block

**Purpose:** Track project risks, mitigations, and trends.

**Data Model:**
```javascript
{
  id: 'risk-uuid',
  title: 'Reagent supply disruption',
  category: 'supply-chain' | 'technical' | 'personnel' | 'budget' | 'timeline' | 'regulatory',
  severity: 'low' | 'medium' | 'high' | 'critical',
  probability: 'unlikely' | 'possible' | 'likely' | 'certain',
  impact: 'Minor delay, no cost' | 'Moderate delay, some cost' | 'Major delay, significant cost',
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved' | 'accepted',
  source: {
    type: 'meeting' | 'ai-analysis' | 'manual' | 'automated-scan',
    id: 'meeting-uuid' | 'user-uuid',
    timestamp: '2024-03-15T10:00:00Z'
  },
  mitigation: {
    plan: 'Identify alternative suppliers, increase buffer stock',
    owner: 'Lab Manager',
    deadline: '2024-04-01',
    status: 'in-progress',
    actions: [...]
  },
  timeline: [
    { date: '2024-03-15', event: 'Risk identified', note: 'Primary supplier delayed shipment' },
    { date: '2024-03-16', event: 'Mitigation started', note: 'Contacted alternative suppliers' }
  ]
}
```

**Subtabs:**
- **Open Risks:** Active risks by severity
- **Mitigations:** Mitigation plans with progress
- **Sources:** Risk origin breakdown (meetings vs AI vs manual)
- **Trends:** Risk categories over time

**Actions:**
- Add risk
- Update status
- Assign mitigation owner
- Link to project/experiment
- Generate risk report

**Visualizations:**
- Risk matrix (probability × impact)
- Risk trend over time
- Mitigation effectiveness
- Source breakdown

## 5. Workspace Modes

Each workspace tab presents a curated block set for specific workflows.

### 5.1 Command Workspace (Default)

**Purpose:** Focus on today's priorities across all domains.

**Default Blocks:**
- Priority Queue (large, top position)
- Contextual blocks based on active work
- Maximum 6 blocks visible

**Smart Defaults:**
- Shows blocks with urgent items
- Collapses blocks with no active work
- AI can reorganize based on daily intent

### 5.2 Experiments Workspace

**Purpose:** Wet lab operations - experiments, reagents, samples, equipment.

**Default Blocks:**
- Experiment Readiness (large)
- Reagent Watch
- Sample Pipeline
- Equipment Tracker
- Safety Checklist
- Calendar Pressure

### 5.3 Meetings Workspace

**Purpose:** Meeting preparation, live capture, and follow-up.

**Default Blocks:**
- Meeting Studio (full width)
- Priority Queue (action items)
- AI Review (meeting insights)
- Calendar Pressure
- Inbox Signals

### 5.4 Projects Workspace

**Purpose:** Portfolio management - project health, grants, deadlines.

**Default Blocks:**
- Project Health (large)
- Grant Milestones
- Risk Radar
- Team Coordination
- Calendar Pressure
- Data Pipeline (if computational)

### 5.5 Build Workspace

**Purpose:** Customize lab-specific sections and workflows.

**Default Blocks:**
- Custom Sections (large, editor mode)
- Block Library (available blocks)
- Template Gallery
- AI Section Generator

### 5.6 Integrations Workspace

**Purpose:** Configure external connections and data sync.

**Default Blocks:**
- Integration Routes (large)
- Available Integrations Catalog
- OAuth Status Dashboard
- Sync Logs
- Test Connection Tools

### 5.7 Review Workspace

**Purpose:** AI-generated insights, suggestions, and provenance.

**Default Blocks:**
- AI Review (large)
- Priority Queue (suggested actions)
- Meeting Studio (analyzed transcripts)
- Risk Radar (AI-identified risks)
- Provider Configuration

## 6. Integration Layer

### 6.1 OAuth Flow Redesign

**Current Problem:** OAuth setup is confusing and error-prone.

**Solution:** Visual step-by-step wizard with clear progress indicators.

**OAuth Wizard Steps:**

**Step 1: Choose Integration**
- Card grid of available integrations
- Each card shows: logo, name, description, capabilities
- Visual indicators for already-configured integrations

**Step 2: Configure Credentials**
- Clear instructions for obtaining client ID/secret
- Links to developer consoles
- Form validation with helpful error messages
- Option to save for later

**Step 3: Generate Consent URL**
- One-click generate button
- Copy URL to clipboard
- QR code for mobile setup (optional)
- Clear instructions: "Open this URL to authorize LabLink"

**Step 4: Exchange Code**
- Paste authorization code field
- Automatic validation
- Error handling with retry guidance

**Step 5: Test Connection**
- One-click test button
- Real-time status updates
- Success confirmation with next steps
- Troubleshooting guidance on failure

**Step 6: Configure Sync**
- Choose what to sync (calendar, meetings, messages)
- Set sync frequency
- Configure notifications
- Review permissions

### 6.2 Integration Status Dashboard

**Real-time Health Monitoring:**
- Connection status (connected, disconnected, error)
- Last successful sync timestamp
- Sync frequency and next scheduled sync
- Error logs with actionable fixes
- Token expiry warnings

**Supported Integrations:**

**Zoom:**
- Meeting creation
- Recording retrieval
- Bot join for live transcription
- Participant list and attendance

**Google Workspace:**
- Calendar sync (read/write)
- Google Meet integration
- Drive file access
- Gmail message import

**Microsoft 365:**
- Outlook calendar sync
- Teams meeting integration
- SharePoint document access
- Exchange email import

**Slack:**
- Channel message monitoring
- Direct message import
- Notification posting
- File access

**Notion:**
- Database sync
- Page import
- Bi-directional updates
- Block-level sync

**Generic:**
- Email (IMAP/SMTP)
- Calendar (CalDAV)
- File storage (WebDAV)

### 6.3 Graceful Degradation

**Without OAuth:**
- Manual meeting import (transcript file upload)
- Local rules-based meeting analysis
- Manual task creation
- File-based data import

**Without AI Provider:**
- Rules-based meeting extraction (speaker labels, action items)
- Manual workspace organization
- Template-based section creation
- Keyword-based priority scoring

**Offline Mode:**
- Full local functionality
- Queued sync when reconnected
- Local data persistence
- Conflict resolution on reconnect

## 7. Performance Requirements

### 7.1 Loading Performance

**Targets:**
- Initial HTML paint: < 200ms
- First Contentful Paint: < 500ms
- Time to Interactive: < 1000ms
- Largest Contentful Paint: < 1500ms

**Strategies:**
- Inline critical CSS
- Defer non-critical JavaScript
- Lazy load blocks (IntersectionObserver)
- Code splitting by workspace
- Service Worker for offline

### 7.2 Runtime Performance

**Targets:**
- Event handling: < 50ms (< 100ms acceptable)
- State updates: < 100ms
- Route transitions: < 200ms
- Animations: 60fps (16.67ms per frame)
- Memory: < 50MB baseline + 5MB per visible block

**Strategies:**
- Virtual scrolling for long lists
- Debounced search/filter (300ms)
- Throttled scroll handlers (16ms)
- Web Worker for heavy computation
- IndexedDB for large datasets

### 7.3 AI Streaming Performance

**Targets:**
- Connection establishment: < 100ms
- First token: < 500ms
- Token rendering: 60fps
- Cancellation response: < 50ms

**Strategies:**
- Server-Sent Events (native browser support)
- Token buffering (display every 50ms, buffer faster tokens)
- Smooth typing animation (CSS transitions)
- Proper connection cleanup
- Exponential backoff on errors

### 7.4 Accessibility

**WCAG 2.1 AA Compliance:**
- Keyboard navigation for all features
- Focus management (trap in modals, restore on close)
- Screen reader announcements (aria-live regions)
- Color contrast ratios ≥ 4.5:1
- Text resize up to 200% without loss of functionality
- Skip links for main content
- Descriptive link text
- Form labels and error messages

**Keyboard Shortcuts:**
- `Cmd/Ctrl + K`: Command palette
- `1-7`: Switch workspace tabs
- `Tab/Shift+Tab`: Navigate blocks
- `Space`: Toggle block collapse
- `Esc`: Close modals/cancel actions
- `Cmd/Ctrl + /`: Keyboard shortcuts help

## 8. Implementation Plan (GSD + Wiggum Loops)

### Phase 1: Foundation (Days 1-3)

**Loop 1.1: Design System**
- Create `web/public/design-system.css` with complete variable set
- Build utility classes (spacing, typography, colors)
- Create component primitives (buttons, inputs, cards)
- **Completion Promise:** `LABLINK_V3_DESIGN_SYSTEM_COMPLETE`

**Loop 1.2: Web Component Base**
- Implement `LabBlock` base class with lifecycle hooks
- Create `LabWorkspace` container component
- Build event bus for cross-component communication
- **Completion Promise:** `LABLINK_V3_WEB_COMPONENTS_BASE_COMPLETE`

**Loop 1.3: Block Registry**
- Implement manifest system
- Build context evaluation engine
- Create lazy registration system
- **Completion Promise:** `LABLINK_V3_BLOCK_REGISTRY_COMPLETE`

**Loop 1.4: Streaming AI Backend**
- Add SSE endpoints to backend
- Implement token streaming
- Add progress events
- Build cancellation support
- **Completion Promise:** `LABLINK_V3_STREAMING_API_COMPLETE`

**Loop 1.5: Streaming AI Frontend**
- Create `StreamingAIService` class
- Build loading state machine
- Implement UI states (connecting, streaming, complete, error)
- **Completion Promise:** `LABLINK_V3_STREAMING_UI_COMPLETE`

**Verification:**
- Design system renders correctly in all browsers
- Web Components register and mount/unmount properly
- Block registry correctly evaluates context rules
- AI streaming shows smooth typing effect
- Cancellation works instantly
- **Phase Commit:** "feat: v3 foundation - design system, web components, streaming AI"

---

### Phase 2: Core Blocks (Days 4-6)

**Loop 2.1: Priority Queue Block**
- Convert to Web Component (`lab-priority-queue`)
- Implement subtabs (Today, Blocked, Waiting)
- Add drag-and-drop reordering
- **Completion Promise:** `LABLINK_V3_PRIORITY_QUEUE_COMPLETE`

**Loop 2.2: Meeting Studio Block**
- Convert to Web Component (`lab-meeting-studio`)
- Implement subtabs (Agenda, Transcript, Actions)
- Connect to streaming AI for meeting analysis
- Add live transcript capture (SpeechRecognition API)
- **Completion Promise:** `LABLINK_V3_MEETING_STUDIO_COMPLETE`

**Loop 2.3: Experiment Readiness Block**
- Create Web Component (`lab-experiment-readiness`)
- Implement subtabs (Protocols, Samples, Approvals)
- Build data model and state management
- **Completion Promise:** `LABLINK_V3_EXPERIMENT_READINESS_COMPLETE`

**Loop 2.4: AI Review Block**
- Convert to Web Component (`lab-ai-review`)
- Implement subtabs (Suggestions, Providers, Runs)
- Show streaming progress and history
- **Completion Promise:** `LABLINK_V3_AI_REVIEW_COMPLETE`

**Verification:**
- All blocks render correctly
- Subtabs switch smoothly
- State persists in LocalStorage
- Drag-and-drop works across all blocks
- **Phase Commit:** "feat: v3 core blocks - priority queue, meeting studio, experiments, AI review"

---

### Phase 3: Lab Features (Days 7-9)

**Loop 3.1: Equipment Tracker**
- Create `lab-equipment-tracker` component
- Build equipment list UI
- Implement maintenance scheduling
- Add booking calendar
- **Completion Promise:** `LABLINK_V3_EQUIPMENT_TRACKER_COMPLETE`

**Loop 3.2: Sample Pipeline**
- Create `lab-sample-pipeline` component
- Build cohort management UI
- Implement Kanban pipeline view
- Add QC dashboard
- Create freezer map visualization
- **Completion Promise:** `LABLINK_V3_SAMPLE_PIPELINE_COMPLETE`

**Loop 3.3: Reagent Watch**
- Convert to Web Component (`lab-reagent-watch`)
- Implement stock tracking
- Add vendor management
- Build low-stock alerts
- **Completion Promise:** `LABLINK_V3_REAGENT_WATCH_COMPLETE`

**Loop 3.4: Safety Checklist**
- Create `lab-safety-checklist` component
- Build protocol management
- Implement training tracker
- Add incident reporting
- **Completion Promise:** `LABLINK_V3_SAFETY_CHECKLIST_COMPLETE`

**Verification:**
- Equipment can be added and tracked
- Sample pipeline shows correct stages
- Reagent stock updates work
- Safety protocols load correctly
- **Phase Commit:** "feat: v3 lab features - equipment, samples, reagents, safety"

---

### Phase 4: Coordination Features (Days 10-12)

**Loop 4.1: Team Coordination**
- Create `lab-team-coordination` component
- Build team roster UI
- Implement work assignment
- Add handoff system
- Create skill matrix view
- **Completion Promise:** `LABLINK_V3_TEAM_COORDINATION_COMPLETE`

**Loop 4.2: Grant Milestones**
- Create `lab-grant-milestones` component
- Build Gantt chart timeline
- Implement budget tracking
- Add deliverable management
- Create alert system
- **Completion Promise:** `LABLINK_V3_GRANT_MILESTONES_COMPLETE`

**Loop 4.3: Risk Radar**
- Convert to Web Component (`lab-risk-radar`)
- Build risk matrix visualization
- Implement mitigation tracking
- Add trend analysis
- **Completion Promise:** `LABLINK_V3_RISK_RADAR_COMPLETE`

**Loop 4.4: Data Pipeline**
- Create `lab-data-pipeline` component
- Build job monitoring UI
- Implement queue visualization
- Add results dashboard
- **Completion Promise:** `LABLINK_V3_DATA_PIPELINE_COMPLETE`

**Verification:**
- Team assignments work correctly
- Grant timelines render accurately
- Risk matrix calculates properly
- Pipeline jobs show correct status
- **Phase Commit:** "feat: v3 coordination - team, grants, risks, data pipelines"

---

### Phase 5: Integration Layer (Days 13-15)

**Loop 5.1: OAuth Wizard**
- Create step-by-step wizard component
- Build credential configuration UI
- Implement consent URL generation
- Add code exchange flow
- Create connection testing
- **Completion Promise:** `LABLINK_V3_OAUTH_WIZARD_COMPLETE`

**Loop 5.2: Integration Status Dashboard**
- Create `lab-integration-routes` component
- Build real-time health monitoring
- Implement sync configuration
- Add error log viewer
- **Completion Promise:** `LABLINK_V3_INTEGRATION_STATUS_COMPLETE`

**Loop 5.3: Zoom Integration**
- Implement meeting creation flow
- Add recording retrieval
- Build bot join functionality
- **Completion Promise:** `LABLINK_V3_ZOOM_INTEGRATION_COMPLETE`

**Loop 5.4: Additional Integrations**
- Google Workspace (calendar, meet, drive)
- Microsoft 365 (outlook, teams, sharepoint)
- Slack (messages, notifications)
- **Completion Promise:** `LABLINK_V3_INTEGRATIONS_COMPLETE`

**Verification:**
- OAuth flow completes successfully
- Integration status shows correct health
- Zoom meetings can be created (with credentials)
- Graceful degradation without credentials
- **Phase Commit:** "feat: v3 integrations - oauth wizard, status dashboard, zoom, google, microsoft"

---

### Phase 6: Polish & Performance (Days 16-18)

**Loop 6.1: Animations**
- Implement block entrance animations (staggered fade-in)
- Add smooth transitions between workspaces
- Polish AI streaming typing effect
- Add micro-interactions (button hover, toggle)
- **Completion Promise:** `LABLINK_V3_ANIMATIONS_COMPLETE`

**Loop 6.2: Loading States**
- Build skeleton screens for all blocks
- Add loading spinners where appropriate
- Implement optimistic UI updates
- Polish error states
- **Completion Promise:** `LABLINK_V3_LOADING_STATES_COMPLETE`

**Loop 6.3: Error Boundaries**
- Implement error boundaries for all components
- Add graceful error recovery
- Create user-friendly error messages
- Build error reporting system
- **Completion Promise:** `LABLINK_V3_ERROR_HANDLING_COMPLETE`

**Loop 6.4: Performance Optimization**
- Implement virtual scrolling for long lists
- Add IntersectionObserver for lazy rendering
- Optimize event handlers (debounce, throttle)
- Profile and fix memory leaks
- **Completion Promise:** `LABLINK_V3_PERFORMANCE_COMPLETE`

**Loop 6.5: Accessibility Audit**
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Add ARIA labels
- Implement focus management
- **Completion Promise:** `LABLINK_V3_ACCESSIBILITY_COMPLETE`

**Verification:**
- Lighthouse score > 90 (performance, accessibility, best practices)
- All animations run at 60fps
- No memory leaks detected
- Keyboard navigation works for all features
- Screen reader announcements are clear
- **Phase Commit:** "feat: v3 polish - animations, loading states, error handling, performance, accessibility"

---

### Phase 7: Documentation & Release (Days 19-21)

**Loop 7.1: User Documentation**
- Write block usage guides
- Create workspace mode documentation
- Document keyboard shortcuts
- Build integration setup guides
- **Completion Promise:** `LABLINK_V3_USER_DOCS_COMPLETE`

**Loop 7.2: Developer Documentation**
- Document Web Component API
- Write block plugin development guide
- Create manifest schema reference
- Build example custom blocks
- **Completion Promise:** `LABLINK_V3_DEV_DOCS_COMPLETE`

**Loop 7.3: Migration Guide**
- Document v2 to v3 changes
- Create data migration scripts
- Build compatibility layer for existing data
- **Completion Promise:** `LABLINK_V3_MIGRATION_COMPLETE`

**Loop 7.4: Final Testing**
- Run full smoke tests
- Validate all completion promises
- Test on Windows/Mac/Linux
- Test on Chrome/Firefox/Safari/Edge
- **Completion Promise:** `LABLINK_V3_TESTING_COMPLETE`

**Loop 7.5: Release**
- Update version to 0.2.0-beta.1
- Run `npm run release:check`
- Publish to npm with beta tag
- Update GitHub release notes
- **Completion Promise:** `LABLINK_V3_PRODUCTION_READY`

**Final Verification:**
- All completion promises are true
- `npm run validate` passes
- `npm run web:smoke` passes
- `npm run release:check` passes
- Beta can be installed globally and works
- **Phase Commit:** "feat: v3 production release - documentation, migration, final testing"

---

## 9. Success Criteria

### 9.1 User Experience
- AI actions stream smoothly with visible progress (no freezing)
- Interface feels modern and professional
- Blocks appear only when relevant (context-aware)
- Workspace modes provide clear value
- Integration setup is straightforward
- Performance feels snappy (< 100ms interactions)

### 9.2 Technical
- All completion promises are true
- Lighthouse performance score > 90
- Lighthouse accessibility score > 95
- Zero memory leaks detected
- Works in Chrome, Firefox, Safari, Edge
- Zero-dependency bootstrap maintained

### 9.3 Lab Features
- All 17 blocks implemented and functional
- Each block has working subtabs
- Data models are complete and validated
- Context rules correctly show/hide blocks
- Setup wizards guide users to enable features

### 9.4 Integration
- OAuth wizard completes successfully
- Integration health monitoring works
- Graceful degradation without credentials
- All 6 integrations have working adapters

### 9.5 Platform
- Web Component plugin API is documented
- Custom blocks can be added without core changes
- Block manifest system is extensible
- Event bus enables cross-block coordination

## 10. Ralph Loop Verification

After each Wiggum loop:
1. Verify completion promise is true
2. Test feature in isolation
3. Test feature integrated with existing work
4. Check performance impact
5. Verify accessibility
6. Remove temporary scaffolding
7. Commit with descriptive message
8. Update STATE.md

After each phase:
1. Run full smoke test
2. Verify all phase completion promises
3. Check for code duplication to remove
4. Profile performance
5. Test in all target browsers
6. Update ROADMAP.md
7. Phase commit with summary

## 11. Completion Promise Hierarchy

```
LABLINK_V3_PRODUCTION_READY
├── LABLINK_V3_FOUNDATION_COMPLETE
│   ├── LABLINK_V3_DESIGN_SYSTEM_COMPLETE
│   ├── LABLINK_V3_WEB_COMPONENTS_BASE_COMPLETE
│   ├── LABLINK_V3_BLOCK_REGISTRY_COMPLETE
│   ├── LABLINK_V3_STREAMING_API_COMPLETE
│   └── LABLINK_V3_STREAMING_UI_COMPLETE
├── LABLINK_V3_CORE_BLOCKS_COMPLETE
│   ├── LABLINK_V3_PRIORITY_QUEUE_COMPLETE
│   ├── LABLINK_V3_MEETING_STUDIO_COMPLETE
│   ├── LABLINK_V3_EXPERIMENT_READINESS_COMPLETE
│   └── LABLINK_V3_AI_REVIEW_COMPLETE
├── LABLINK_V3_LAB_FEATURES_COMPLETE
│   ├── LABLINK_V3_EQUIPMENT_TRACKER_COMPLETE
│   ├── LABLINK_V3_SAMPLE_PIPELINE_COMPLETE
│   ├── LABLINK_V3_REAGENT_WATCH_COMPLETE
│   └── LABLINK_V3_SAFETY_CHECKLIST_COMPLETE
├── LABLINK_V3_COORDINATION_COMPLETE
│   ├── LABLINK_V3_TEAM_COORDINATION_COMPLETE
│   ├── LABLINK_V3_GRANT_MILESTONES_COMPLETE
│   ├── LABLINK_V3_RISK_RADAR_COMPLETE
│   └── LABLINK_V3_DATA_PIPELINE_COMPLETE
├── LABLINK_V3_INTEGRATION_COMPLETE
│   ├── LABLINK_V3_OAUTH_WIZARD_COMPLETE
│   ├── LABLINK_V3_INTEGRATION_STATUS_COMPLETE
│   ├── LABLINK_V3_ZOOM_INTEGRATION_COMPLETE
│   └── LABLINK_V3_INTEGRATIONS_COMPLETE
├── LABLINK_V3_POLISH_COMPLETE
│   ├── LABLINK_V3_ANIMATIONS_COMPLETE
│   ├── LABLINK_V3_LOADING_STATES_COMPLETE
│   ├── LABLINK_V3_ERROR_HANDLING_COMPLETE
│   ├── LABLINK_V3_PERFORMANCE_COMPLETE
│   └── LABLINK_V3_ACCESSIBILITY_COMPLETE
└── LABLINK_V3_RELEASE_COMPLETE
    ├── LABLINK_V3_USER_DOCS_COMPLETE
    ├── LABLINK_V3_DEV_DOCS_COMPLETE
    ├── LABLINK_V3_MIGRATION_COMPLETE
    └── LABLINK_V3_TESTING_COMPLETE
```

## 12. Risks & Mitigations

### Risk: Codex concurrent edits
**Mitigation:**
- Coordinate on file boundaries (split work by file)
- Frequent commits with clear messages
- Pull before each work session
- Focus on new files vs editing existing

### Risk: Zero-dependency constraint limits architecture
**Mitigation:**
- Web Components are native, no dependencies needed
- Progressive enhancement for animations (Motion One optional)
- Service Worker is native
- IndexedDB is native

### Risk: Web Component browser compatibility
**Mitigation:**
- Web Components supported in all modern browsers (2020+)
- Polyfills available for older browsers if needed
- Graceful degradation to standard HTML/CSS

### Risk: Streaming AI requires backend changes
**Mitigation:**
- SSE endpoints are straightforward to add
- No LLM provider changes needed (same APIs, streaming responses)
- Fallback to fetch if SSE unavailable

### Risk: 21-day timeline is aggressive
**Mitigation:**
- Can deploy incrementally (foundation first, then blocks)
- Some blocks can ship in later phases
- Core UX improvements (streaming, design system) deliver value early
- Wiggum loops ensure each piece is production-ready before moving on

---

**End of PRD v3.0**
