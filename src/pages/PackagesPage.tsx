import { useMemo, useState } from 'react'
import {
  DEMO_PACKAGES,
  PACKAGE_CATEGORIES,
  formatPackagePrice,
  type PackageCategory,
} from '../data/packages'
import './PackagesPage.css'

export function PackagesPage() {
  const [category, setCategory] = useState<PackageCategory | 'All'>('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_PACKAGES.filter((item) => {
      if (category !== 'All' && item.category !== category) return false
      if (!q) return true
      const hay = [item.name, item.category, item.summary, item.recommendedFor, ...item.includes]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [category, query])

  return (
    <section className="portal-page packages-page" aria-label="Packages">
      <div className="pkg-demo-banner" role="status">
        <strong>Dummy data for demo only.</strong>
        <span>
          These packages (Preventive Health Checkup, Eye Care, Heart Care, and others) are sample
          content for UI preview. They are not live tariffs and should not be used for billing or
          patient counselling.
        </span>
      </div>

      <div className="pkg-toolbar">
        <input
          type="search"
          className="pkg-search"
          placeholder="Search dummy packages…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search dummy packages"
        />
        <div className="pkg-category-row" role="tablist" aria-label="Package categories">
          {PACKAGE_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={`pkg-chip${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="pkg-count">
        Showing {filtered.length} dummy package{filtered.length === 1 ? '' : 's'}
      </p>

      <div className="pkg-grid">
        {filtered.map((item) => (
          <article key={item.id} className="pkg-card">
            <div className="pkg-card-top">
              <span className="pkg-badge">Dummy</span>
              <span className="pkg-category">{item.category}</span>
            </div>
            <h3>{item.name}</h3>
            <p className="pkg-summary">{item.summary}</p>
            <ul className="pkg-includes">
              {item.includes.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="pkg-meta">
              <div>
                <span className="pkg-meta-label">Duration</span>
                <span>{item.duration}</span>
              </div>
              <div>
                <span className="pkg-meta-label">Recommended</span>
                <span>{item.recommendedFor}</span>
              </div>
            </div>
            <div className="pkg-footer">
              <div className="pkg-price">
                <span className="pkg-price-label">Demo price</span>
                <strong>{formatPackagePrice(item.price)}</strong>
              </div>
              <button type="button" className="pkg-cta" disabled title="Demo only — not bookable">
                Demo only
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="pkg-empty">No dummy packages match this filter.</p>
      ) : null}
    </section>
  )
}
