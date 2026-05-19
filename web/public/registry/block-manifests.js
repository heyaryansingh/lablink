// Lab Link V3 - Block Manifest Definitions

/**
 * All block manifests defining metadata, capabilities, and context rules
 */
export const BLOCK_MANIFESTS = {
  'priority-queue': {
    id: 'priority-queue',
    version: '1.0.0',
    title: 'Priority Queue',
    description: 'Manage today\'s priorities, blocked tasks, and waiting items',
    domain: 'Execution',
    category: 'core',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['tasks', 'priorities', 'blocking'],
    dataDependencies: [],
    alwaysVisible: true,
    subtabs: [
      { id: 'today', label: 'Today', icon: 'calendar' },
      { id: 'blocked', label: 'Blocked', icon: 'alert' },
      { id: 'waiting', label: 'Waiting', icon: 'clock' },
    ],
    actions: [
      { id: 'add-task', label: 'Add Task', primary: true },
      { id: 'clear-completed', label: 'Clear Completed' },
    ],
    component: 'lab-priority-queue',
  },

  'experiment-readiness': {
    id: 'experiment-readiness',
    version: '1.0.0',
    title: 'Experiment Readiness',
    description: 'Track experimental protocols, samples, and approvals',
    domain: 'Wet Lab',
    category: 'lab-operations',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['experiments', 'protocols', 'approvals'],
    dataDependencies: ['experiments'],
    subtabs: [
      { id: 'protocols', label: 'Protocols', icon: 'doc' },
      { id: 'samples', label: 'Samples', icon: 'beaker' },
      { id: 'approvals', label: 'Approvals', icon: 'check' },
    ],
    actions: [
      { id: 'add-experiment', label: 'Add Experiment', primary: true },
      { id: 'import-protocol', label: 'Import Protocol' },
    ],
    component: 'lab-experiment-readiness',
    setup: {
      title: 'Enable Experiment Tracking',
      description: 'Track protocols, samples, and approvals for wet lab experiments',
      steps: [
        'Import existing experiments or create new ones',
        'Upload protocol documents',
        'Configure approval workflows',
      ],
      estimatedTime: '15 minutes',
    },
  },

  'meeting-studio': {
    id: 'meeting-studio',
    version: '1.0.0',
    title: 'Meeting Studio',
    description: 'Prepare agendas, capture transcripts, and track actions',
    domain: 'Coordination',
    category: 'communication',
    size: { default: 'large', min: 'large', max: 'full' },
    capabilities: ['meetings', 'transcripts', 'actions'],
    dataDependencies: ['meetings'],
    subtabs: [
      { id: 'agenda', label: 'Agenda', icon: 'list' },
      { id: 'transcript', label: 'Transcript', icon: 'mic' },
      { id: 'actions', label: 'Actions', icon: 'check-circle' },
    ],
    actions: [
      { id: 'start-meeting', label: 'Start Meeting', primary: true },
      { id: 'import-transcript', label: 'Import Transcript' },
      { id: 'analyze-ai', label: 'Analyze with AI' },
    ],
    component: 'lab-meeting-studio',
    setup: {
      title: 'Enable Meeting Management',
      description: 'Manage meeting agendas, transcripts, and action items',
      steps: [
        'Schedule or import meetings',
        'Connect Zoom/Google Meet/Teams (optional)',
        'Enable AI analysis (requires provider)',
      ],
      estimatedTime: '5 minutes',
    },
  },

  'reagent-watch': {
    id: 'reagent-watch',
    version: '1.0.0',
    title: 'Reagent Watch',
    description: 'Track reagent stock levels, vendors, and supply risks',
    domain: 'Supply',
    category: 'inventory',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['inventory', 'vendors', 'alerts'],
    dataDependencies: ['inventory'],
    subtabs: [
      { id: 'stock', label: 'Stock', icon: 'box' },
      { id: 'vendors', label: 'Vendors', icon: 'truck' },
      { id: 'risks', label: 'Risks', icon: 'alert' },
    ],
    actions: [
      { id: 'add-reagent', label: 'Add Reagent', primary: true },
      { id: 'order-supplies', label: 'Order Supplies' },
    ],
    component: 'lab-reagent-watch',
    setup: {
      title: 'Enable Reagent Tracking',
      description: 'Monitor reagent inventory, vendors, and supply chain risks',
      steps: [
        'Import reagent inventory (CSV or manual)',
        'Add vendor contacts',
        'Set low-stock alert thresholds',
      ],
      estimatedTime: '20 minutes',
    },
  },

  'equipment-tracker': {
    id: 'equipment-tracker',
    version: '1.0.0',
    title: 'Equipment Tracker',
    description: 'Manage equipment status, maintenance, and bookings',
    domain: 'Operations',
    category: 'lab-management',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['equipment', 'maintenance', 'bookings'],
    dataDependencies: ['equipment'],
    subtabs: [
      { id: 'list', label: 'Equipment', icon: 'wrench' },
      { id: 'maintenance', label: 'Maintenance', icon: 'calendar' },
      { id: 'bookings', label: 'Bookings', icon: 'clock' },
    ],
    actions: [
      { id: 'add-equipment', label: 'Add Equipment', primary: true },
      { id: 'schedule-maintenance', label: 'Schedule Maintenance' },
      { id: 'book-equipment', label: 'Book Equipment' },
    ],
    component: 'lab-equipment-tracker',
    setup: {
      title: 'Enable Equipment Tracking',
      description: 'Track equipment status, maintenance schedules, and bookings',
      steps: [
        'Import equipment list (CSV or manual)',
        'Set up maintenance schedules',
        'Configure booking rules',
      ],
      estimatedTime: '10 minutes',
    },
  },

  'sample-pipeline': {
    id: 'sample-pipeline',
    version: '1.0.0',
    title: 'Sample Pipeline',
    description: 'Track samples through processing stages and QC checkpoints',
    domain: 'Wet Lab',
    category: 'lab-operations',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['samples', 'pipelines', 'qc'],
    dataDependencies: ['samples'],
    subtabs: [
      { id: 'cohorts', label: 'Cohorts', icon: 'folder' },
      { id: 'pipeline', label: 'Pipeline', icon: 'git-branch' },
      { id: 'qc', label: 'QC', icon: 'check-square' },
      { id: 'storage', label: 'Storage', icon: 'archive' },
    ],
    actions: [
      { id: 'register-samples', label: 'Register Samples', primary: true },
      { id: 'advance-stage', label: 'Advance Stage' },
      { id: 'record-qc', label: 'Record QC' },
    ],
    component: 'lab-sample-pipeline',
    setup: {
      title: 'Enable Sample Pipeline',
      description: 'Track samples through processing stages with QC checkpoints',
      steps: [
        'Define pipeline stages',
        'Register sample cohorts',
        'Configure QC thresholds',
        'Map storage locations',
      ],
      estimatedTime: '15 minutes',
    },
  },

  'grant-milestones': {
    id: 'grant-milestones',
    version: '1.0.0',
    title: 'Grant Milestones',
    description: 'Track grant deliverables, budgets, and deadlines',
    domain: 'Portfolio',
    category: 'funding',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['grants', 'budgets', 'milestones'],
    dataDependencies: ['grants'],
    subtabs: [
      { id: 'timeline', label: 'Timeline', icon: 'calendar' },
      { id: 'budget', label: 'Budget', icon: 'dollar' },
      { id: 'deliverables', label: 'Deliverables', icon: 'check-circle' },
      { id: 'reports', label: 'Reports', icon: 'file' },
    ],
    actions: [
      { id: 'add-grant', label: 'Add Grant', primary: true },
      { id: 'add-milestone', label: 'Add Milestone' },
      { id: 'track-spending', label: 'Track Spending' },
    ],
    component: 'lab-grant-milestones',
    setup: {
      title: 'Enable Grant Tracking',
      description: 'Monitor grant timelines, budgets, and deliverables',
      steps: [
        'Import active grants',
        'Define milestones and deliverables',
        'Set up budget tracking',
        'Schedule reporting deadlines',
      ],
      estimatedTime: '20 minutes',
    },
  },

  'team-coordination': {
    id: 'team-coordination',
    version: '1.0.0',
    title: 'Team Coordination',
    description: 'Coordinate lab members, assignments, and handoffs',
    domain: 'People',
    category: 'coordination',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['team', 'assignments', 'handoffs'],
    dataDependencies: ['team'],
    subtabs: [
      { id: 'team', label: 'Team', icon: 'users' },
      { id: 'schedule', label: 'Schedule', icon: 'calendar' },
      { id: 'skills', label: 'Skills', icon: 'award' },
      { id: 'handoffs', label: 'Handoffs', icon: 'arrow-right' },
    ],
    actions: [
      { id: 'add-member', label: 'Add Member', primary: true },
      { id: 'assign-work', label: 'Assign Work' },
      { id: 'create-handoff', label: 'Create Handoff' },
    ],
    component: 'lab-team-coordination',
    setup: {
      title: 'Enable Team Coordination',
      description: 'Manage team members, work assignments, and handoffs',
      steps: [
        'Add team members',
        'Define roles and skills',
        'Set up work schedules',
        'Configure handoff workflows',
      ],
      estimatedTime: '15 minutes',
    },
  },

  'data-pipeline': {
    id: 'data-pipeline',
    version: '1.0.0',
    title: 'Data Pipeline',
    description: 'Monitor computational workflows and analysis jobs',
    domain: 'Computational',
    category: 'analysis',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['pipelines', 'jobs', 'results'],
    dataDependencies: ['pipelines'],
    subtabs: [
      { id: 'active', label: 'Active', icon: 'activity' },
      { id: 'queue', label: 'Queue', icon: 'list' },
      { id: 'results', label: 'Results', icon: 'check-circle' },
      { id: 'monitoring', label: 'Monitoring', icon: 'bar-chart' },
    ],
    actions: [
      { id: 'submit-job', label: 'Submit Job', primary: true },
      { id: 'view-logs', label: 'View Logs' },
      { id: 'download-results', label: 'Download Results' },
    ],
    component: 'lab-data-pipeline',
    setup: {
      title: 'Enable Data Pipeline',
      description: 'Track computational workflows and analysis jobs',
      steps: [
        'Configure pipeline engine (Nextflow, Snakemake, etc.)',
        'Connect to compute cluster',
        'Define workflow repositories',
        'Set up result storage',
      ],
      estimatedTime: '25 minutes',
    },
  },

  'safety-checklist': {
    id: 'safety-checklist',
    version: '1.0.0',
    title: 'Safety Checklist',
    description: 'Track safety protocols, training, and incidents',
    domain: 'Compliance',
    category: 'safety',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['protocols', 'training', 'incidents'],
    dataDependencies: ['safety'],
    subtabs: [
      { id: 'protocols', label: 'Protocols', icon: 'shield' },
      { id: 'training', label: 'Training', icon: 'book' },
      { id: 'incidents', label: 'Incidents', icon: 'alert-triangle' },
      { id: 'inspections', label: 'Inspections', icon: 'clipboard' },
    ],
    actions: [
      { id: 'log-incident', label: 'Log Incident', primary: true },
      { id: 'schedule-training', label: 'Schedule Training' },
      { id: 'review-protocol', label: 'Review Protocol' },
    ],
    component: 'lab-safety-checklist',
    setup: {
      title: 'Enable Safety Tracking',
      description: 'Monitor safety protocols, training, and incident reporting',
      steps: [
        'Import safety protocols',
        'Add team training requirements',
        'Configure incident reporting workflow',
        'Schedule inspections',
      ],
      estimatedTime: '15 minutes',
    },
  },

  'risk-radar': {
    id: 'risk-radar',
    version: '1.0.0',
    title: 'Risk Radar',
    description: 'Track project risks, mitigations, and trends',
    domain: 'Controls',
    category: 'risk-management',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['risks', 'mitigations', 'trends'],
    dataDependencies: ['risks'],
    subtabs: [
      { id: 'open', label: 'Open', icon: 'alert' },
      { id: 'mitigations', label: 'Mitigations', icon: 'shield' },
      { id: 'sources', label: 'Sources', icon: 'git-branch' },
      { id: 'trends', label: 'Trends', icon: 'trending-up' },
    ],
    actions: [
      { id: 'add-risk', label: 'Add Risk', primary: true },
      { id: 'update-status', label: 'Update Status' },
      { id: 'assign-owner', label: 'Assign Owner' },
    ],
    component: 'lab-risk-radar',
    setup: {
      title: 'Enable Risk Tracking',
      description: 'Monitor risks, mitigations, and trends across projects',
      steps: [
        'Import existing risks',
        'Define risk categories',
        'Set up mitigation workflows',
        'Configure alert thresholds',
      ],
      estimatedTime: '10 minutes',
    },
  },

  'project-health': {
    id: 'project-health',
    version: '1.0.0',
    title: 'Project Health',
    description: 'Monitor project status, deadlines, and risks',
    domain: 'Portfolio',
    category: 'project-management',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['projects', 'status', 'deadlines'],
    dataDependencies: ['projects'],
    subtabs: [
      { id: 'active', label: 'Active', icon: 'folder' },
      { id: 'at-risk', label: 'At Risk', icon: 'alert' },
      { id: 'deadlines', label: 'Deadlines', icon: 'calendar' },
    ],
    actions: [
      { id: 'add-project', label: 'Add Project', primary: true },
      { id: 'update-status', label: 'Update Status' },
    ],
    component: 'lab-project-health',
    setup: {
      title: 'Enable Project Tracking',
      description: 'Monitor project health, deadlines, and risk factors',
      steps: [
        'Import active projects',
        'Define project owners',
        'Set milestone deadlines',
      ],
      estimatedTime: '10 minutes',
    },
  },

  'calendar-pressure': {
    id: 'calendar-pressure',
    version: '1.0.0',
    title: 'Calendar Pressure',
    description: 'View upcoming meetings, deadlines, and prep needs',
    domain: 'Schedule',
    category: 'time-management',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['calendar', 'deadlines', 'prep'],
    dataDependencies: ['calendar'],
    subtabs: [
      { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
      { id: 'prep', label: 'Prep', icon: 'clipboard' },
      { id: 'deadlines', label: 'Deadlines', icon: 'clock' },
    ],
    actions: [
      { id: 'sync-calendar', label: 'Sync Calendar', primary: true },
    ],
    component: 'lab-calendar-pressure',
  },

  'integration-routes': {
    id: 'integration-routes',
    version: '1.0.0',
    title: 'Integration Routes',
    description: 'Manage OAuth connections, sync status, and integrations',
    domain: 'Systems',
    category: 'integration',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['oauth', 'sync', 'integrations'],
    dataDependencies: [],
    subtabs: [
      { id: 'oauth', label: 'OAuth', icon: 'key' },
      { id: 'sync', label: 'Sync', icon: 'refresh' },
      { id: 'publish', label: 'Publish', icon: 'share' },
    ],
    actions: [
      { id: 'add-integration', label: 'Add Integration', primary: true },
      { id: 'test-connection', label: 'Test Connection' },
    ],
    component: 'lab-integration-routes',
  },

  'ai-review': {
    id: 'ai-review',
    version: '1.0.0',
    title: 'AI Review',
    description: 'Review AI suggestions, provider status, and run history',
    domain: 'Review',
    category: 'ai',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['suggestions', 'providers', 'history'],
    dataDependencies: ['aiSuggestions'],
    subtabs: [
      { id: 'suggestions', label: 'Suggestions', icon: 'lightbulb' },
      { id: 'providers', label: 'Providers', icon: 'server' },
      { id: 'runs', label: 'Runs', icon: 'activity' },
    ],
    actions: [
      { id: 'approve-suggestion', label: 'Approve', primary: true },
      { id: 'reject-suggestion', label: 'Reject' },
      { id: 'configure-provider', label: 'Configure Provider' },
    ],
    component: 'lab-ai-review',
  },

  'inbox-signals': {
    id: 'inbox-signals',
    version: '1.0.0',
    title: 'Inbox Signals',
    description: 'Filter actionable messages and collaboration requests',
    domain: 'Messages',
    category: 'communication',
    size: { default: 'medium', min: 'medium', max: 'large' },
    capabilities: ['messages', 'filtering', 'collaboration'],
    dataDependencies: ['messages'],
    subtabs: [
      { id: 'actionable', label: 'Actionable', icon: 'inbox' },
      { id: 'collab', label: 'Collab', icon: 'users' },
      { id: 'low-noise', label: 'Low Noise', icon: 'filter' },
    ],
    actions: [
      { id: 'sync-inbox', label: 'Sync Inbox', primary: true },
    ],
    component: 'lab-inbox-signals',
  },

  'custom-sections': {
    id: 'custom-sections',
    version: '1.0.0',
    title: 'Custom Sections',
    description: 'Create lab-specific sections and workflows',
    domain: 'Lab OS',
    category: 'customization',
    size: { default: 'large', min: 'medium', max: 'xlarge' },
    capabilities: ['custom', 'builder', 'templates'],
    dataDependencies: [],
    alwaysVisible: true,
    subtabs: [
      { id: 'installed', label: 'Installed', icon: 'box' },
      { id: 'templates', label: 'Templates', icon: 'layout' },
      { id: 'ai-build', label: 'AI Build', icon: 'wand' },
    ],
    actions: [
      { id: 'create-section', label: 'Create Section', primary: true },
      { id: 'ai-generate', label: 'AI Generate' },
    ],
    component: 'lab-custom-sections',
  },
};

// Export individual manifests for convenience
export const PRIORITY_QUEUE_MANIFEST = BLOCK_MANIFESTS['priority-queue'];
export const EXPERIMENT_READINESS_MANIFEST = BLOCK_MANIFESTS['experiment-readiness'];
export const MEETING_STUDIO_MANIFEST = BLOCK_MANIFESTS['meeting-studio'];
export const REAGENT_WATCH_MANIFEST = BLOCK_MANIFESTS['reagent-watch'];
export const EQUIPMENT_TRACKER_MANIFEST = BLOCK_MANIFESTS['equipment-tracker'];
export const SAMPLE_PIPELINE_MANIFEST = BLOCK_MANIFESTS['sample-pipeline'];
export const GRANT_MILESTONES_MANIFEST = BLOCK_MANIFESTS['grant-milestones'];
export const TEAM_COORDINATION_MANIFEST = BLOCK_MANIFESTS['team-coordination'];
export const DATA_PIPELINE_MANIFEST = BLOCK_MANIFESTS['data-pipeline'];
export const SAFETY_CHECKLIST_MANIFEST = BLOCK_MANIFESTS['safety-checklist'];
export const RISK_RADAR_MANIFEST = BLOCK_MANIFESTS['risk-radar'];
export const PROJECT_HEALTH_MANIFEST = BLOCK_MANIFESTS['project-health'];
export const CALENDAR_PRESSURE_MANIFEST = BLOCK_MANIFESTS['calendar-pressure'];
export const INTEGRATION_ROUTES_MANIFEST = BLOCK_MANIFESTS['integration-routes'];
export const AI_REVIEW_MANIFEST = BLOCK_MANIFESTS['ai-review'];
export const INBOX_SIGNALS_MANIFEST = BLOCK_MANIFESTS['inbox-signals'];
export const CUSTOM_SECTIONS_MANIFEST = BLOCK_MANIFESTS['custom-sections'];
