import type { CSSProperties } from 'react'
import { EMERGENCY_CODES, HELPDESK_CONTACTS } from '../data/seed'

export function HeaderBar() {
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
          <h1 className="brand-title">Intercom Directory</h1>
        </div>
      </div>

      <div className="service-banners">
        <div className="service-banner service-banner-green">
          <div className="service-banner-inner">
            <div className="service-row" aria-label="Emergency code numbers">
              <span className="service-label">Emergency Codes :</span>
              <ul className="service-chips">
                {EMERGENCY_CODES.map((code) => (
                  <li key={code.id} title={code.meaning}>
                    <button
                      type="button"
                      className={`emergency-chip code-${code.id}`}
                      style={{ '--code-color': code.color } as CSSProperties}
                    >
                      <span className="code-blink" aria-hidden />
                      <span className="chip-name">{code.name}</span>
                      <span className="chip-sep" aria-hidden>
                        :
                      </span>
                      <span className="chip-ext">{code.extension}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="service-banner service-banner-gold">
          <div className="service-banner-inner">
            <div className="service-row" aria-label="Helpdesk and quick dial">
              <span className="service-label">Quick Dial :</span>
              <ul className="service-chips">
                {HELPDESK_CONTACTS.map((item) => (
                  <li key={item.id}>
                    <button type="button" className="helpdesk-chip">
                      <span className="chip-name">{item.name}</span>
                      <span className="chip-sep" aria-hidden>
                        :
                      </span>
                      <span className="chip-ext">{item.extension}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
