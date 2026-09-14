import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import {
  SPECIALITIES,
  isSpecialityActive,
  isSpecialityVisible,
  specialityImageUrl,
  specialityPageUrl,
  type Speciality,
} from '../data/specialities'
import './SpecialityPage.css'

function firstLetter(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

export function SpecialityPage() {
  const [selectedLetter, setSelectedLetter] = useState('')

  const visibleData = useMemo(() => SPECIALITIES.filter(isSpecialityVisible), [])

  const letters = useMemo(
    () =>
      [...new Set(visibleData.map((item) => firstLetter(item.n)))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [visibleData],
  )

  const filtered = useMemo(() => {
    if (!selectedLetter) return visibleData
    return visibleData.filter((item) => item.n.toUpperCase().startsWith(selectedLetter))
  }, [selectedLetter, visibleData])

  const clearFilter = () => setSelectedLetter('')

  const openSpeciality = (item: Speciality) => {
    window.open(specialityPageUrl(item), '_blank', 'noopener,noreferrer')
  }

  const onCardClick = (event: MouseEvent<HTMLDivElement>, item: Speciality) => {
    if ((event.target as HTMLElement).closest('.spec-btn')) return
    openSpeciality(item)
  }

  const onCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, item: Speciality) => {
    if (event.key === 'Enter') openSpeciality(item)
  }

  return (
    <section className="portal-page speciality-page" aria-label="Speciality">
      <div className="spec-wrapper">
        <div className="spec-filter-row">
          <div className="spec-filter-box">
            <select
              id="mobileFilter"
              value={selectedLetter}
              onChange={(event) => setSelectedLetter(event.target.value)}
              aria-label="Filter specialities by letter"
            >
              <option value="">All Specialities</option>
              {letters.map((letter) => (
                <option key={letter} value={letter}>
                  {letter}
                </option>
              ))}
            </select>

            <button
              id="clearSpecFilter"
              className={`spec-filter-clear${selectedLetter ? ' show' : ''}`}
              type="button"
              aria-label="Clear speciality filter"
              onClick={clearFilter}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>

        <div id="specGrid" className="spec-grid">
          {filtered.map((item) => {
            const active = isSpecialityActive(item)
            const url = specialityPageUrl(item)

            return (
              <div
                key={item.n}
                className={`spec-card ${active ? 'card-active' : 'card-inactive'}`}
                role={active ? 'link' : undefined}
                tabIndex={active ? 0 : undefined}
                onClick={active ? (event) => onCardClick(event, item) : undefined}
                onKeyDown={active ? (event) => onCardKeyDown(event, item) : undefined}
              >
                <div className="spec-icon">
                  <img src={specialityImageUrl(item)} alt={item.n} loading="lazy" />
                </div>
                <h3>{item.n}</h3>
                <p>{item.d}</p>
                {active ? (
                  <a
                    href={url}
                    className="spec-btn"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Know more about ${item.n}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Know More
                  </a>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
