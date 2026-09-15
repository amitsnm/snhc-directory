import { useMemo } from 'react'
import {
  TICKET_TYPES,
  formatTatHours,
  getDashboardStats,
  loadTickets,
  refreshTicketEscalation,
} from '../data/helpdesk'
import { PORTAL_NAV, type PortalPage } from '../data/portal'

interface Props {
  onNavigate: (page: PortalPage) => void
}

const HOME_CARD_META: Record<
  Exclude<PortalPage, 'home'>,
  { icon: string; accent: string }
> = {
  emergency: { icon: 'EC', accent: 'gold' },
  helpdesk: { icon: 'HD', accent: 'teal' },
  'tariff-master': { icon: 'TM', accent: 'green' },
  intercom: { icon: 'IC', accent: 'gold' },
  doctors: { icon: 'DR', accent: 'green' },
  speciality: { icon: 'SP', accent: 'teal' },
  packages: { icon: 'PK', accent: 'gold' },
  admin: { icon: 'AD', accent: 'teal' },
}

export function HomePage({ onNavigate }: Props) {
  const stats = useMemo(() => {
    const tickets = loadTickets().map((t) => refreshTicketEscalation(t))
    return getDashboardStats(tickets)
  }, [])

  return (
    <section className="portal-page home-page" aria-label="Home">
      <div className="home-dashboard">
        <div className="home-dashboard-head">
          <div>
            <h3>Helpdesk dashboard</h3>
            <p>Live ticket snapshot for Grievance & Feedback, Enquiry, and Complaint.</p>
          </div>
          <button type="button" className="home-dashboard-cta" onClick={() => onNavigate('helpdesk')}>
            Open Helpdesk
          </button>
        </div>

        <div className="home-dash-stats">
          <button type="button" className="home-dash-stat" onClick={() => onNavigate('helpdesk')}>
            <span>Open</span>
            <strong>{stats.open}</strong>
          </button>
          <button type="button" className="home-dash-stat" onClick={() => onNavigate('helpdesk')}>
            <span>In Progress</span>
            <strong>{stats.inProgress}</strong>
          </button>
          <button type="button" className="home-dash-stat is-alert" onClick={() => onNavigate('helpdesk')}>
            <span>Overdue TAT</span>
            <strong>{stats.overdue}</strong>
          </button>
          <button type="button" className="home-dash-stat is-alert" onClick={() => onNavigate('helpdesk')}>
            <span>Escalated</span>
            <strong>{stats.escalated}</strong>
          </button>
          <button type="button" className="home-dash-stat" onClick={() => onNavigate('helpdesk')}>
            <span>Resolved</span>
            <strong>{stats.resolved}</strong>
          </button>
          <button type="button" className="home-dash-stat" onClick={() => onNavigate('helpdesk')}>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </button>
        </div>

        <div className="home-dash-types">
          {TICKET_TYPES.map((item) => (
            <button
              key={item.id}
              type="button"
              className="home-dash-type"
              onClick={() => onNavigate('helpdesk')}
            >
              <strong>{item.shortLabel}</strong>
              <span>
                {stats.byType[item.id]} tickets · TAT {formatTatHours(item.tatHours)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="home-grid">
        {PORTAL_NAV.filter((item) => item.id !== 'home').map((item, index) => {
          const meta = HOME_CARD_META[item.id as Exclude<PortalPage, 'home'>]
          return (
            <button
              key={item.id}
              type="button"
              className={`home-card home-card-${meta.accent}`}
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => onNavigate(item.id)}
            >
              <span className="home-card-glow" aria-hidden />
              <span className="home-card-icon" aria-hidden>
                {meta.icon}
              </span>
              <div className="home-card-body">
                <h3>{item.title}</h3>
                <p>{item.blurb}</p>
              </div>
              <span className="home-card-cta">
                Open
                <span className="home-card-arrow" aria-hidden>
                  →
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
