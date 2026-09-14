import { PORTAL_NAV, type PortalPage } from '../data/portal'

interface Props {
  activePage: PortalPage
  onNavigate: (page: PortalPage) => void
}

export function HeaderBar({ activePage, onNavigate }: Props) {
  const current = PORTAL_NAV.find((item) => item.id === activePage) ?? PORTAL_NAV[0]

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand-block" href="https://nirankarihealthcity.org/" target="_blank" rel="noreferrer">
          <img
            className="brand-logo"
            src="/snhc-logo.png?v=3"
            width={280}
            height={86}
            alt="Sant Nirankari HEALTHCITY — Service With Humility"
          />
        </a>

        <div className="header-center">
          <h1 className="brand-title">Internal Portal</h1>
        </div>
      </div>

      <nav className="portal-nav" aria-label="Portal sections">
        <div className="portal-nav-inner">
          {PORTAL_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`portal-nav-link${activePage === item.id ? ' is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="page-title-bar">
        <div className="page-title-inner">
          <h2 className="page-title">{current.title}</h2>
          <p className="page-blurb">{current.blurb}</p>
        </div>
      </div>
    </header>
  )
}
