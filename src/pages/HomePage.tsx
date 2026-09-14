import { PORTAL_NAV, type PortalPage } from '../data/portal'

interface Props {
  onNavigate: (page: PortalPage) => void
}

const HOME_CARD_META: Record<
  Exclude<PortalPage, 'home'>,
  { icon: string; accent: string }
> = {
  'service-master': { icon: 'SM', accent: 'green' },
  intercom: { icon: 'IC', accent: 'gold' },
  doctors: { icon: 'DR', accent: 'green' },
  speciality: { icon: 'SP', accent: 'teal' },
  packages: { icon: 'PK', accent: 'gold' },
}

export function HomePage({ onNavigate }: Props) {
  return (
    <section className="portal-page home-page" aria-label="Home">
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
