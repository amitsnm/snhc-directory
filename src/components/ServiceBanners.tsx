import type { CSSProperties } from 'react'
import { EMERGENCY_CODES, HELPDESK_CONTACTS } from '../data/seed'

export function ServiceBanners() {
  return (
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
  )
}
