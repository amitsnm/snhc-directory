import type { CSSProperties } from 'react'
import { EMERGENCY_CODES, HELPDESK_CONTACTS } from '../data/seed'
import './EmergencyPage.css'

function dial(extension: string) {
  window.location.href = `tel:*${extension}`
}

export function EmergencyPage() {
  const clinical = EMERGENCY_CODES.filter((c) => c.kind === 'clinical')
  const admin = EMERGENCY_CODES.filter((c) => c.kind === 'admin')

  return (
    <section className="portal-page emergency-page" aria-label="Emergency Codes">
      <div className="emg-intro">
        <p>
          Official Sant Nirankari Health City emergency telephone codes from the CODES Circular. Dial the code to
          trigger collective response; the system identifies the originating location and alerts responders.
        </p>
      </div>

      <div className="emg-section">
        <div className="emg-section-head">
          <h3>Clinical Codes</h3>
          <span>Collective clinical response</span>
        </div>
        <div className="emg-grid">
          {clinical.map((code) => (
            <button
              key={code.id}
              type="button"
              className="emg-card"
              style={{ '--code-color': code.color } as CSSProperties}
              onClick={() => dial(code.extension)}
              title={`Dial *${code.extension}`}
            >
              <span className="emg-swatch" aria-hidden />
              <div className="emg-card-body">
                <strong>{code.name}</strong>
                <span className="emg-meaning">{code.meaning}</span>
              </div>
              <span className="emg-ext">*{code.extension}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="emg-section">
        <div className="emg-section-head">
          <h3>Non-Clinical / Administrative Codes</h3>
          <span>Quick administrative response</span>
        </div>
        <div className="emg-grid">
          {admin.map((code) => (
            <button
              key={code.id}
              type="button"
              className="emg-card"
              style={{ '--code-color': code.color } as CSSProperties}
              onClick={() => dial(code.extension)}
              title={`Dial *${code.extension}`}
            >
              <span className="emg-swatch" aria-hidden />
              <div className="emg-card-body">
                <strong>{code.name}</strong>
                <span className="emg-meaning">{code.meaning}</span>
              </div>
              <span className="emg-ext">*{code.extension}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="emg-section">
        <div className="emg-section-head">
          <h3>Quick Dial</h3>
          <span>Key desks and help lines</span>
        </div>
        <div className="emg-quick-grid">
          {HELPDESK_CONTACTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="emg-quick-card"
              onClick={() => {
                window.location.href = `tel:${item.extension}`
              }}
              title={`Dial ${item.extension}`}
            >
              <span className="emg-quick-name">{item.name}</span>
              <span className="emg-quick-ext">{item.extension}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="emg-footnote">
        Source: SNHC CODES Circular — clinical codes (*5000–*5777) and non-clinical codes (*6000–*6222). Quick dial
        extensions from the hospital directory.
      </p>
    </section>
  )
}
