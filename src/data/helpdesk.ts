export type TicketType = 'grievance-feedback' | 'enquiry' | 'complaint'
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Escalated'

export interface HelpdeskDepartment {
  id: string
  name: string
  owner: string
  extension: string
}

export interface EscalationLevel {
  level: number
  label: string
  afterHours: number
  role: string
  action: string
}

export interface TicketTypeConfig {
  id: TicketType
  label: string
  shortLabel: string
  description: string
  /** Target TAT in hours for L1 response / closure target */
  tatHours: number
  defaultPriority: TicketPriority
  defaultDepartmentId: string
}

export interface HelpdeskTicket {
  id: string
  type: TicketType
  subject: string
  description: string
  requesterName: string
  requesterContact: string
  departmentId: string
  priority: TicketPriority
  status: TicketStatus
  createdAt: string
  updatedAt: string
  dueAt: string
  escalationLevel: number
  notes: string
}

export const HELPDESK_DEPARTMENTS: HelpdeskDepartment[] = [
  { id: 'patient-experience', name: 'Patient Experience', owner: 'PX Desk', extension: '1500' },
  { id: 'operations', name: 'Operations', owner: 'Operations Manager', extension: '1522' },
  { id: 'nursing', name: 'Nursing Administration', owner: 'CNO Office', extension: '1580' },
  { id: 'billing', name: 'Billing & TPA', owner: 'Billing Desk', extension: '1062' },
  { id: 'pharmacy', name: 'Pharmacy', owner: 'Pharmacy In-charge', extension: '1161' },
  { id: 'facilities', name: 'Housekeeping & Facilities', owner: 'Facilities', extension: '1598' },
  { id: 'it', name: 'IT Helpdesk', owner: 'IT Support', extension: '1559' },
  { id: 'medical-admin', name: 'Medical Administration', owner: 'MS Office', extension: '1010' },
  { id: 'hr', name: 'Human Resources', owner: 'HR Desk', extension: '1528' },
  { id: 'security', name: 'Security', owner: 'Security Control', extension: '1598' },
]

export const TICKET_TYPES: TicketTypeConfig[] = [
  {
    id: 'grievance-feedback',
    label: 'Grievance & Feedback',
    shortLabel: 'Grievance',
    description: 'Patient or staff grievance and feedback for service improvement.',
    tatHours: 48,
    defaultPriority: 'Medium',
    defaultDepartmentId: 'patient-experience',
  },
  {
    id: 'enquiry',
    label: 'Enquiry',
    shortLabel: 'Enquiry',
    description: 'General information requests about services, departments, or processes.',
    tatHours: 24,
    defaultPriority: 'Low',
    defaultDepartmentId: 'operations',
  },
  {
    id: 'complaint',
    label: 'Complaint',
    shortLabel: 'Complaint',
    description: 'Formal complaints requiring investigation, ownership, and closure.',
    tatHours: 24,
    defaultPriority: 'High',
    defaultDepartmentId: 'patient-experience',
  },
]

/** Escalation matrix — hours after creation / missed TAT. */
export const ESCALATION_MATRIX: EscalationLevel[] = [
  {
    level: 1,
    label: 'L1 — Department Owner',
    afterHours: 0,
    role: 'Assigned department owner',
    action: 'Acknowledge ticket and start action within department TAT.',
  },
  {
    level: 2,
    label: 'L2 — Functional Head',
    afterHours: 24,
    role: 'Department / functional head',
    action: 'Review delay, re-assign if needed, and confirm recovery plan.',
  },
  {
    level: 3,
    label: 'L3 — Operations / PX Lead',
    afterHours: 48,
    role: 'Operations Manager / Patient Experience Lead',
    action: 'Intervene on breached TAT and update requester with ETA.',
  },
  {
    level: 4,
    label: 'L4 — Leadership',
    afterHours: 72,
    role: 'MS / COO office',
    action: 'Leadership escalation for unresolved Critical / Complaint tickets.',
  },
]

export const TICKET_STATUSES: TicketStatus[] = [
  'Open',
  'In Progress',
  'Pending',
  'Resolved',
  'Closed',
  'Escalated',
]

export const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical']

const STORAGE_KEY = 'snhc-helpdesk-tickets-v1'
const SEQ_KEY = 'snhc-helpdesk-seq-v1'

function pad(n: number, width = 4): string {
  return String(n).padStart(width, '0')
}

function dateStamp(d = new Date()): string {
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1, 2)
  const day = pad(d.getDate(), 2)
  return `${y}${m}${day}`
}

export function createTicketId(now = new Date()): string {
  const stamp = dateStamp(now)
  const seqRaw = Number(localStorage.getItem(SEQ_KEY) || '0')
  const next = Number.isFinite(seqRaw) ? seqRaw + 1 : 1
  localStorage.setItem(SEQ_KEY, String(next))
  return `HD-${stamp}-${pad(next)}`
}

export function getTicketTypeConfig(type: TicketType): TicketTypeConfig {
  return TICKET_TYPES.find((item) => item.id === type) ?? TICKET_TYPES[0]
}

export function getDepartment(id: string): HelpdeskDepartment | undefined {
  return HELPDESK_DEPARTMENTS.find((item) => item.id === id)
}

export function computeDueAt(createdAt: string, type: TicketType): string {
  const hours = getTicketTypeConfig(type).tatHours
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000).toISOString()
}

export function computeEscalationLevel(ticket: HelpdeskTicket, now = new Date()): number {
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    return ticket.escalationLevel
  }
  const ageHours = (now.getTime() - new Date(ticket.createdAt).getTime()) / (60 * 60 * 1000)
  let level = 1
  for (const row of ESCALATION_MATRIX) {
    if (ageHours >= row.afterHours) level = row.level
  }
  if (now.getTime() > new Date(ticket.dueAt).getTime() && level < 2) level = 2
  return level
}

export function isOverdue(ticket: HelpdeskTicket, now = new Date()): boolean {
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') return false
  return now.getTime() > new Date(ticket.dueAt).getTime()
}

export function formatTatHours(hours: number): string {
  if (hours < 24) return `${hours}h`
  const days = hours / 24
  return Number.isInteger(days) ? `${days}d` : `${days.toFixed(1)}d`
}

export function formatTicketWhen(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const DEMO_TICKETS: HelpdeskTicket[] = [
  {
    id: 'HD-20260914-0001',
    type: 'complaint',
    subject: 'Delay in discharge billing',
    description: 'Family reported long wait at billing counter during discharge.',
    requesterName: 'Front Office',
    requesterContact: '1100',
    departmentId: 'billing',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-09-14T08:15:00.000Z',
    updatedAt: '2026-09-14T09:00:00.000Z',
    dueAt: '2026-09-15T08:15:00.000Z',
    escalationLevel: 1,
    notes: 'Billing supervisor informed.',
  },
  {
    id: 'HD-20260914-0002',
    type: 'enquiry',
    subject: 'OPD package inclusions for Heart Care',
    description: 'Corporate desk asked for Heart Care package inclusions for quote.',
    requesterName: 'Corporate Desk',
    requesterContact: '1670',
    departmentId: 'operations',
    priority: 'Low',
    status: 'Open',
    createdAt: '2026-09-14T10:05:00.000Z',
    updatedAt: '2026-09-14T10:05:00.000Z',
    dueAt: '2026-09-15T10:05:00.000Z',
    escalationLevel: 1,
    notes: '',
  },
  {
    id: 'HD-20260913-0003',
    type: 'grievance-feedback',
    subject: 'Feedback on nursing courtesy in Daycare',
    description: 'Positive feedback with one suggestion on communication during chemo wait.',
    requesterName: 'Patient Experience',
    requesterContact: '1500',
    departmentId: 'nursing',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-09-13T06:40:00.000Z',
    updatedAt: '2026-09-13T16:20:00.000Z',
    dueAt: '2026-09-15T06:40:00.000Z',
    escalationLevel: 1,
    notes: 'Closed after nurse educator briefing.',
  },
  {
    id: 'HD-20260912-0004',
    type: 'complaint',
    subject: 'AC not working in waiting lounge',
    description: 'Multiple visitors reported warm waiting lounge near OPD.',
    requesterName: 'Security',
    requesterContact: '1598',
    departmentId: 'facilities',
    priority: 'Critical',
    status: 'Escalated',
    createdAt: '2026-09-12T04:00:00.000Z',
    updatedAt: '2026-09-13T11:00:00.000Z',
    dueAt: '2026-09-13T04:00:00.000Z',
    escalationLevel: 3,
    notes: 'L3 escalation — vendor visit pending.',
  },
]

export function loadTickets(): HelpdeskTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_TICKETS))
      localStorage.setItem(SEQ_KEY, '4')
      return DEMO_TICKETS.map((t) => ({ ...t }))
    }
    const parsed = JSON.parse(raw) as HelpdeskTicket[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return DEMO_TICKETS.map((t) => ({ ...t }))
  }
}

export function saveTickets(tickets: HelpdeskTicket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
}

export function refreshTicketEscalation(ticket: HelpdeskTicket, now = new Date()): HelpdeskTicket {
  const level = computeEscalationLevel(ticket, now)
  const overdue = isOverdue(ticket, now)
  let status = ticket.status
  if (overdue && status !== 'Resolved' && status !== 'Closed' && level >= 3) {
    status = 'Escalated'
  }
  return {
    ...ticket,
    escalationLevel: level,
    status,
    updatedAt: ticket.updatedAt,
  }
}

export interface HelpdeskDashboardStats {
  total: number
  open: number
  inProgress: number
  overdue: number
  escalated: number
  resolved: number
  byType: Record<TicketType, number>
  byDepartment: { id: string; name: string; count: number }[]
}

export function getDashboardStats(tickets: HelpdeskTicket[], now = new Date()): HelpdeskDashboardStats {
  const live = tickets.map((t) => refreshTicketEscalation(t, now))
  const byType: Record<TicketType, number> = {
    'grievance-feedback': 0,
    enquiry: 0,
    complaint: 0,
  }
  const deptCounts = new Map<string, number>()

  let open = 0
  let inProgress = 0
  let overdue = 0
  let escalated = 0
  let resolved = 0

  for (const ticket of live) {
    byType[ticket.type] += 1
    deptCounts.set(ticket.departmentId, (deptCounts.get(ticket.departmentId) ?? 0) + 1)
    if (ticket.status === 'Open') open += 1
    if (ticket.status === 'In Progress' || ticket.status === 'Pending') inProgress += 1
    if (ticket.status === 'Escalated') escalated += 1
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') resolved += 1
    if (isOverdue(ticket, now)) overdue += 1
  }

  const byDepartment = [...deptCounts.entries()]
    .map(([id, count]) => ({
      id,
      name: getDepartment(id)?.name ?? id,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    total: live.length,
    open,
    inProgress,
    overdue,
    escalated,
    resolved,
    byType,
    byDepartment,
  }
}

export interface CreateTicketInput {
  type: TicketType
  subject: string
  description: string
  requesterName: string
  requesterContact: string
  departmentId: string
  priority: TicketPriority
  notes?: string
}

export function createTicket(input: CreateTicketInput): HelpdeskTicket {
  const createdAt = new Date().toISOString()
  const typeConfig = getTicketTypeConfig(input.type)
  return {
    id: createTicketId(),
    type: input.type,
    subject: input.subject.trim(),
    description: input.description.trim(),
    requesterName: input.requesterName.trim(),
    requesterContact: input.requesterContact.trim(),
    departmentId: input.departmentId || typeConfig.defaultDepartmentId,
    priority: input.priority || typeConfig.defaultPriority,
    status: 'Open',
    createdAt,
    updatedAt: createdAt,
    dueAt: computeDueAt(createdAt, input.type),
    escalationLevel: 1,
    notes: (input.notes || '').trim(),
  }
}
