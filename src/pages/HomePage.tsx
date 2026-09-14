import { PORTAL_NAV, type PortalPage } from '../data/portal'

interface Props {
  onNavigate: (page: PortalPage) => void
}

export function HomePage({ onNavigate }: Props) {
  return (
    <section className="portal-page home-page" aria-label="Home">
      <div className="home-grid">
        {PORTAL_NAV.filter((item) => item.id !== 'home').map((item) => (
          <button
            key={item.id}
            type="button"
            className="home-card"
            onClick={() => onNavigate(item.id)}
          >
            <h3>{item.title}</h3>
            <p>{item.blurb}</p>
            <span className="home-card-cta">Open</span>
          </button>
        ))}
      </div>
    </section>
  )
}
