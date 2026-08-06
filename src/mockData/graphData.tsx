export interface NodeData {
  label: string;
  category: 'repo' | 'module' | 'file' | 'commit' | 'developer' | 'issue';
  risk?: 'low' | 'medium' | 'high';
  description?: string;
  author?: string;
  subtext?: string;
}

export const initialNodes = [
  {
    id: 'repo-1',
    type: 'customNode',
    data: { label: 'RepoSense Core', category: 'repo', description: 'Main software evolution repository', subtext: 'Root Memory Engine' },
    position: { x: 420, y: 30 },
  },
  {
    id: 'mod-auth',
    type: 'customNode',
    data: { label: 'Auth Service', category: 'module', description: 'Authentication & Session Engine', subtext: 'pkg/auth' },
    position: { x: 180, y: 170 },
  },
  {
    id: 'mod-payments',
    type: 'customNode',
    data: { label: 'Payments API', category: 'module', description: 'Stripe & Billing Pipeline', subtext: 'pkg/payments' },
    position: { x: 660, y: 170 },
  },
  {
    id: 'file-jwt',
    type: 'customNode',
    data: { label: 'jwt_verifier.py', category: 'file', risk: 'high', description: 'JWT Token Validation Engine', subtext: 'Core Auth Logic' },
    position: { x: 60, y: 320 },
  },
  {
    id: 'file-stripe',
    type: 'customNode',
    data: { label: 'checkout_session.py', category: 'file', risk: 'medium', description: 'Stripe Webhook Handler', subtext: 'Payment Flow' },
    position: { x: 540, y: 320 },
  },
  {
    id: 'commit-89a',
    type: 'customNode',
    data: { label: 'PR #104', category: 'commit', risk: 'high', author: 'Alex Rivera', subtext: 'JWT Refactor' },
    position: { x: 300, y: 320 },
  },
  {
    id: 'dev-alex',
    type: 'customNode',
    data: { label: 'Alex Rivera', category: 'developer', description: 'Lead Backend Engineer', subtext: 'Staff Engineer' },
    position: { x: 300, y: 470 },
  },
  {
    id: 'issue-404',
    type: 'customNode',
    data: { label: 'Issue #404', category: 'issue', risk: 'high', subtext: 'Auth Race Condition' },
    position: { x: 60, y: 470 },
  }
];

export const initialEdges = [
  { id: 'e1', source: 'repo-1', target: 'mod-auth', animated: true, type: 'smoothstep', style: { stroke: '#6366F1', strokeWidth: 2 } },
  { id: 'e2', source: 'repo-1', target: 'mod-payments', animated: true, type: 'smoothstep', style: { stroke: '#6366F1', strokeWidth: 2 } },
  { id: 'e3', source: 'mod-auth', target: 'file-jwt', type: 'smoothstep', style: { stroke: '#38BDF8', strokeWidth: 2 } },
  { id: 'e4', source: 'mod-payments', target: 'file-stripe', type: 'smoothstep', style: { stroke: '#38BDF8', strokeWidth: 2 } },
  { id: 'e5', source: 'commit-89a', target: 'file-jwt', label: 'MODIFIED', animated: true, type: 'smoothstep', style: { stroke: '#B5442C', strokeWidth: 2 } },
  { id: 'e6', source: 'dev-alex', target: 'commit-89a', label: 'AUTHORED', type: 'smoothstep', style: { stroke: '#2E7D5B', strokeWidth: 2 } },
  { id: 'e7', source: 'issue-404', target: 'file-jwt', label: 'LINKED_TO', animated: true, type: 'smoothstep', style: { stroke: '#B5442C', strokeWidth: 2 } },
  { id: 'e8', source: 'commit-89a', target: 'file-stripe', label: 'IMPACTS', type: 'smoothstep', style: { stroke: '#B8862F', strokeWidth: 2, strokeDasharray: '4,4' } },
];

export const mockPRs = [
  {
    id: 'PR #104',
    title: 'Centralize JWT Validation & Deprecate Legacy Auth',
    author: 'Alex Rivera',
    authorRole: 'Staff Engineer',
    riskScore: 84,
    riskLevel: 'High Risk',
    riskColor: '#B5442C',
    summary: 'This pull request completes the authentication refactor started three weeks ago. JWT validation has been centralized into jwt_verifier.py and legacy authentication components have been removed.',
    impactedModules: [
      { name: 'pkg/auth', severity: 'Critical', isDriver: true },
      { name: 'pkg/payments', severity: 'High', isDriver: false },
      { name: 'api/v2/checkout', severity: 'Medium', isDriver: false },
    ],
    historicalFailures: [
      { test: 'test_auth_race_condition.py', failRate: '88% failure rate post-auth changes', commitHash: 'c89a2e' },
      { test: 'test_payment_callback.py', failRate: '42% regression correlation', commitHash: 'f4019a' },
    ],
  },
  {
    id: 'PR #102',
    title: 'Optimize Stripe Webhook Retry Logic with Exponential Backoff',
    author: 'Elena Rostova',
    authorRole: 'Senior Infra Dev',
    riskScore: 28,
    riskLevel: 'Low Risk',
    riskColor: '#2E7D5B',
    summary: 'Introduces an exponential backoff mechanism for failed Stripe webhook events to prevent thundering herd issues on gateway timeout.',
    impactedModules: [
      { name: 'pkg/payments', severity: 'Low', isDriver: false },
    ],
    historicalFailures: [],
  }
];

export const mockAnalytics = {
  hotspots: [
    { name: 'jwt_verifier.py', changes: 42, risk: 88, isHotspot: true },
    { name: 'checkout_session.py', changes: 31, risk: 64, isHotspot: true },
    { name: 'router_v2.py', changes: 27, risk: 52, isHotspot: false },
    { name: 'user_model.py', changes: 19, risk: 30, isHotspot: false },
    { name: 'db_pool.go', changes: 12, risk: 18, isHotspot: false },
  ],
  developerExpertise: [
    {
      name: 'Alex Rivera',
      role: 'Backend Architect',
      commits: 142,
      primaryModule: 'Auth & Security',
      ownershipData: [
        { name: 'Auth', value: 75, color: '#243B6B' },
        { name: 'Payments', value: 15, color: '#B8862F' },
        { name: 'Core', value: 10, color: '#5B5F6B' },
      ]
    },
    {
      name: 'Elena Rostova',
      role: 'Infrastructure Lead',
      commits: 98,
      primaryModule: 'Payments & Billing',
      ownershipData: [
        { name: 'Payments', value: 80, color: '#2E7D5B' },
        { name: 'API Gateway', value: 20, color: '#243B6B' },
      ]
    },
  ]
};