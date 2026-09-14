import { useMemo, useState, type FormEvent } from 'react'
import {
  ESCALATION_MATRIX,
  HELPDESK_DEPARTMENTS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TICKET_TYPES,
  createTicket,
  formatTatHours,
  formatTicketWhen,
  getDashboardStats,
  getDepartment,
  getTicketTypeConfig,
  isOverdue,
  loadTickets,
  refreshTicketEscalation,
  saveTickets,
  type HelpdeskTicket,
  type TicketPriority,
  type TicketStatus,
  type TicketType,
} from '../data/helpdesk'
import './HelpdeskPage.css'

type Tab = 'dashboard' | 'new' | 'tickets' | 'matrix'

export function HelpdeskPage() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() =>
    loadTickets().map((t) => refreshTicketEscalation(t)),
  )
  const [tab, setTab] = useState<Tab>('dashboard')
  const [filterType, setFilterType] = useState<TicketType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [createdId, setCreatedId] = useState<string | null>(null)

  const [type, setType] = useState<TicketType>('enquiry')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [requesterContact, setRequesterContact] = useState('')
  const [departmentId, setDepartmentId] = useState(TICKET_TYPES[1].defaultDepartmentId)
  const [priority, setPriority] = useState<TicketPriority>('Low')
  const [notes, setNotes] = useState('')

  const stats = useMemo(() => getDashboardStats(tickets), [tickets])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tickets
      .map((t) => refreshTicketEscalation(t))
      .filter((t) => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        if (!q) return true
        const dept = getDepartment(t.departmentId)?.name ?? ''
        const hay = [t.id, t.subject, t.description, t.requesterName, dept, t.priority, t.status]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [tickets, filterType, filterStatus, query])

  const persist = (next: HelpdeskTicket[]) => {
    const refreshed = next.map((t) => refreshTicketEscalation(t))
    setTickets(refreshed)
    saveTickets(refreshed)
  }

  const onTypeChange = (next: TicketType) => {
    const cfg = getTicketTypeConfig(next)
    setType(next)
    setDepartmentId(cfg.defaultDepartmentId)
    setPriority(cfg.defaultPriority)
  }

  const onCreate = (event: FormEvent) => {
    event.preventDefault()
    if (!subject.trim() || !requesterName.trim()) return
    const ticket = createTicket({
      type,
      subject,
      description,
      requesterName,
      requesterContact,
      departmentId,
      priority,
      notes,
    })
    persist([ticket, ...tickets])
    setCreatedId(ticket.id)
    setSubject('')
    setDescription('')
    setRequesterName('')
    setRequesterContact('')
    setNotes('')
    setTab('tickets')
  }

  const updateTicket = (id: string, patch: Partial<HelpdeskTicket>) => {
    persist(
      tickets.map((t) =>
        t.id === id
          ? refreshTicketEscalation({
              ...t,
              ...patch,
              updatedAt: new Date().toISOString(),
            })
          : t,
      ),
    )
  }

  return (
    <section className="portal-page helpdesk-page" aria-label="Helpdesk">
      <div className="hd-tabs" role="tablist" aria-label="Helpdesk sections">
        {(
          [
            ['dashboard', 'Dashboard'],
            ['new', 'Create Ticket'],
            ['tickets', 'Tickets'],
            ['matrix', 'Escalation Matrix'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`hd-tab${tab === id ? ' is-active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? (
        <div className="hd-dashboard">
          <div className="hd-stat-grid">
            <article className="hd-stat">
              <span className="hd-stat-label">Total</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="hd-stat hd-stat-open">
              <span className="hd-stat-label">Open</span>
              <strong>{stats.open}</strong>
            </article>
            <article className="hd-stat hd-stat-progress">
              <span className="hd-stat-label">In Progress</span>
              <strong>{stats.inProgress}</strong>
            </article>
            <article className="hd-stat hd-stat-overdue">
              <span className="hd-stat-label">Overdue TAT</span>
              <strong>{stats.overdue}</strong>
            </article>
            <article className="hd-stat hd-stat-escalated">
              <span className="hd-stat-label">Escalated</span>
              <strong>{stats.escalated}</strong>
            </article>
            <article className="hd-stat hd-stat-resolved">
              <span className="hd-stat-label">Resolved</span>
              <strong>{stats.resolved}</strong>
            </article>
          </div>

          <div className="hd-dash-panels">
            <article className="hd-panel">
              <h3>By ticket type</h3>
              <ul className="hd-type-bars">
                {TICKET_TYPES.map((item) => {
                  const count = stats.byType[item.id]
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
                  return (
                    <li key={item.id}>
                      <div className="hd-type-row">
                        <span>{item.label}</span>
                        <strong>
                          {count} · TAT {formatTatHours(item.tatHours)}
                        </strong>
                      </div>
                      <div className="hd-bar-track">
                        <div className="hd-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </article>

            <article className="hd-panel">
              <h3>By department</h3>
              <ul className="hd-dept-list">
                {stats.byDepartment.slice(0, 8).map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
                {stats.byDepartment.length === 0 ? <li className="hd-empty">No tickets yet.</li> : null}
              </ul>
            </article>
          </div>

          <article className="hd-panel">
            <div className="hd-panel-head">
              <h3>Recent tickets</h3>
              <button type="button" className="hd-link-btn" onClick={() => setTab('tickets')}>
                View all
              </button>
            </div>
            <div className="hd-table-wrap">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Dept</th>
                    <th>Status</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets
                    .slice()
                    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                    .slice(0, 6)
                    .map((ticket) => (
                      <tr key={ticket.id} className={isOverdue(ticket) ? 'is-overdue' : ''}>
                        <td className="hd-id">{ticket.id}</td>
                        <td>{getTicketTypeConfig(ticket.type).shortLabel}</td>
                        <td>{ticket.subject}</td>
                        <td>{getDepartment(ticket.departmentId)?.name ?? '—'}</td>
                        <td>
                          <span className={`hd-status status-${ticket.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{formatTicketWhen(ticket.dueAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      ) : null}

      {tab === 'new' ? (
        <form className="hd-form" onSubmit={onCreate}>
          <div className="hd-type-picker" role="radiogroup" aria-label="Ticket type">
            {TICKET_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={type === item.id}
                className={`hd-type-card${type === item.id ? ' is-active' : ''}`}
                onClick={() => onTypeChange(item.id)}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
                <em>TAT {formatTatHours(item.tatHours)}</em>
              </button>
            ))}
          </div>

          <div className="hd-form-grid">
            <label>
              Subject
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120} />
            </label>
            <label>
              Requester name
              <input
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                required
                maxLength={80}
              />
            </label>
            <label>
              Contact / Ext
              <input
                value={requesterContact}
                onChange={(e) => setRequesterContact(e.target.value)}
                maxLength={40}
                placeholder="Extension or mobile"
              />
            </label>
            <label>
              Assign department
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                {HELPDESK_DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} · Ext {dept.extension}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                {TICKET_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="hd-span-2">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Describe the grievance, enquiry, or complaint…"
              />
            </label>
            <label className="hd-span-2">
              Internal notes
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={1000} />
            </label>
          </div>

          <div className="hd-form-actions">
            <p className="hd-hint">
              A unique ticket ID will be generated (example: <code>HD-YYYYMMDD-0001</code>). Due time is set from the
              type TAT.
            </p>
            <button type="submit" className="hd-primary-btn">
              Create ticket
            </button>
          </div>
        </form>
      ) : null}

      {tab === 'tickets' ? (
        <div className="hd-tickets">
          {createdId ? (
            <div className="hd-flash" role="status">
              Ticket <strong>{createdId}</strong> created and assigned.
              <button type="button" onClick={() => setCreatedId(null)}>
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="hd-toolbar">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, subject, requester…"
              aria-label="Search tickets"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TicketType | 'all')}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              {TICKET_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {TICKET_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="hd-table-wrap">
            <table className="hd-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Esc.</th>
                  <th>Due (TAT)</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className={isOverdue(ticket) ? 'is-overdue' : ''}>
                    <td className="hd-id">{ticket.id}</td>
                    <td>{getTicketTypeConfig(ticket.type).shortLabel}</td>
                    <td>
                      <div className="hd-subject">{ticket.subject}</div>
                      <div className="hd-submeta">
                        {ticket.requesterName}
                        {ticket.requesterContact ? ` · ${ticket.requesterContact}` : ''}
                      </div>
                    </td>
                    <td>{getDepartment(ticket.departmentId)?.name ?? '—'}</td>
                    <td>{ticket.priority}</td>
                    <td>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateTicket(ticket.id, { status: e.target.value as TicketStatus })}
                        aria-label={`Status for ${ticket.id}`}
                      >
                        {TICKET_STATUSES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>L{ticket.escalationLevel}</td>
                    <td>{formatTicketWhen(ticket.dueAt)}</td>
                    <td>
                      <select
                        value={ticket.departmentId}
                        onChange={(e) => updateTicket(ticket.id, { departmentId: e.target.value })}
                        aria-label={`Reassign ${ticket.id}`}
                      >
                        {HELPDESK_DEPARTMENTS.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? <p className="hd-empty">No tickets match these filters.</p> : null}
          </div>
        </div>
      ) : null}

      {tab === 'matrix' ? (
        <div className="hd-matrix">
          <article className="hd-panel">
            <h3>TAT by ticket type</h3>
            <div className="hd-table-wrap">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Default department</th>
                    <th>Default priority</th>
                    <th>TAT</th>
                  </tr>
                </thead>
                <tbody>
                  {TICKET_TYPES.map((item) => (
                    <tr key={item.id}>
                      <td>{item.label}</td>
                      <td>{getDepartment(item.defaultDepartmentId)?.name}</td>
                      <td>{item.defaultPriority}</td>
                      <td>{formatTatHours(item.tatHours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="hd-panel">
            <h3>Escalation matrix</h3>
            <div className="hd-table-wrap">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>After</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ESCALATION_MATRIX.map((row) => (
                    <tr key={row.level}>
                      <td>{row.label}</td>
                      <td>{row.afterHours === 0 ? 'Immediate' : `${row.afterHours}h`}</td>
                      <td>{row.role}</td>
                      <td>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="hd-panel">
            <h3>Department owners</h3>
            <div className="hd-table-wrap">
              <table className="hd-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Owner</th>
                    <th>Ext</th>
                  </tr>
                </thead>
                <tbody>
                  {HELPDESK_DEPARTMENTS.map((dept) => (
                    <tr key={dept.id}>
                      <td>{dept.name}</td>
                      <td>{dept.owner}</td>
                      <td className="hd-id">{dept.extension}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  )
}
