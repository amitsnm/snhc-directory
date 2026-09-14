import { useEffect, useMemo, useRef, useState } from 'react'
import type { PortalPage } from '../data/portal'
import {
  APPOINTMENT_URL,
  DOCTOR_SPECIALITIES,
  DOCTORS,
  FALLBACK_DOCTOR_IMAGE,
  SPECIALITY_PRIORITY,
  type Doctor,
} from '../data/doctors'
import './DoctorsPage.css'

const AUTOCOMPLETE_MIN_CHARS = 2
const AUTOCOMPLETE_MAX_RESULTS = 8

type Suggestion = {
  value: string
  type: 'Doctor' | 'Speciality' | 'Keyword'
  meta: string
  priority: number
  score?: number
}

interface Props {
  onNavigate: (page: PortalPage) => void
}

function normalizeText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsPhrase(text: string, phrase: string): boolean {
  const a = normalizeText(text)
  const b = normalizeText(phrase)
  if (!a || !b) return false
  return ` ${a} `.includes(` ${b} `)
}

function exactMatch(text: string, value: string): boolean {
  return normalizeText(text) === normalizeText(value)
}

function doctorSortName(name: string): string {
  return String(name || '')
    .replace(/^dr\.?\s+/i, '')
    .replace(/^lt\.?\s*col\.?\s+/i, '')
    .trim()
    .toLowerCase()
}

function canBookAppointment(doctor: Doctor): boolean {
  if (containsPhrase(doctor.position, 'attending consultant')) return false
  return doctor.bookAppointment === true
}

function getDoctorPriority(doctor: Doctor): number {
  let best = SPECIALITY_PRIORITY.length + 100
  for (const item of doctor.specialities) {
    const index = SPECIALITY_PRIORITY.findIndex((p) => normalizeText(p) === normalizeText(item))
    if (index !== -1) best = Math.min(best, index)
  }
  return best
}

function getSeniorityPriority(doctor: Doctor): number {
  const position = normalizeText(doctor.position)
  if (containsPhrase(position, 'head')) return 0
  if (containsPhrase(position, 'senior consultant')) return 1
  if (containsPhrase(position, 'associate consultant')) return 3
  if (containsPhrase(position, 'attending consultant')) return 4
  if (containsPhrase(position, 'consultant')) return 2
  return 99
}

function getPrimarySpeciality(doctor: Doctor): string {
  if (!doctor.specialities.length) return ''
  let selected = doctor.specialities[0]
  let selectedPriority = SPECIALITY_PRIORITY.length + 100
  for (const item of doctor.specialities) {
    const index = SPECIALITY_PRIORITY.findIndex((p) => normalizeText(p) === normalizeText(item))
    const priority = index === -1 ? SPECIALITY_PRIORITY.length + 100 : index
    if (priority < selectedPriority) {
      selected = item
      selectedPriority = priority
    }
  }
  return normalizeText(selected)
}

function cardSort(a: Doctor, b: Doctor): number {
  const bookableA = canBookAppointment(a)
  const bookableB = canBookAppointment(b)
  if (bookableA !== bookableB) return bookableA ? -1 : 1

  const specialityDifference = getDoctorPriority(a) - getDoctorPriority(b)
  if (specialityDifference !== 0) return specialityDifference

  const seniorityDifference = getSeniorityPriority(a) - getSeniorityPriority(b)
  if (seniorityDifference !== 0) return seniorityDifference

  const specialityA = getPrimarySpeciality(a)
  const specialityB = getPrimarySpeciality(b)
  if (specialityA && specialityA === specialityB) {
    const sourceDifference = a.sourceOrder - b.sourceOrder
    if (sourceDifference !== 0) return sourceDifference
  }

  return doctorSortName(a.name).localeCompare(doctorSortName(b.name))
}

function getDoctorCategoryKeywords(doctor: Doctor): string[] {
  const output: string[] = []
  for (const doctorSpeciality of doctor.specialities) {
    const category = DOCTOR_SPECIALITIES.find((item) => normalizeText(item.name) === normalizeText(doctorSpeciality))
    if (category) output.push(...category.keywords)
  }
  return output
}

function getSearchScore(doctor: Doctor, rawQuery: string): number {
  const query = normalizeText(rawQuery)
  if (!query) return 0

  const queryWords = query.split(' ').filter(Boolean)
  const doctorName = normalizeText(doctor.name)
  const doctorSimpleName = normalizeText(doctorSortName(doctor.name))
  const specialityFields = [...doctor.specialities, ...doctor.displaySpecialities]
  const doctorKeywords = doctor.keywords
  const categoryKeywords = getDoctorCategoryKeywords(doctor)
  const allFields = [
    doctor.name,
    doctorSimpleName,
    doctor.position,
    doctor.department,
    doctor.qualifications,
    ...specialityFields,
    ...doctorKeywords,
    ...categoryKeywords,
  ]

  const everyWordMatches = queryWords.every((word) => allFields.some((field) => containsPhrase(field, word)))
  if (!everyWordMatches) return -1

  let score = 0
  if (exactMatch(doctorSimpleName, query) || exactMatch(doctorName, query)) score += 5000
  else if (containsPhrase(doctorSimpleName, query)) score += 4200

  for (const field of specialityFields) {
    if (exactMatch(field, query)) score += 4000
    else if (containsPhrase(field, query)) score += 3300
  }

  if (exactMatch(doctor.department, query)) score += 3000
  else if (containsPhrase(doctor.department, query)) score += 2600

  for (const keyword of doctorKeywords) {
    if (exactMatch(keyword, query)) score += 2200
    else if (containsPhrase(keyword, query)) score += 1800
  }

  for (const keyword of categoryKeywords) {
    if (exactMatch(keyword, query)) score += 1700
    else if (containsPhrase(keyword, query)) score += 1400
  }

  if (containsPhrase(doctor.position, query)) score += 400
  if (containsPhrase(doctor.qualifications, query)) score += 250

  if (queryWords.length > 1 && allFields.some((field) => containsPhrase(field, query))) score += 1000

  return score
}

function getAutocompleteScore(item: Suggestion, rawQuery: string): number {
  const query = normalizeText(rawQuery)
  const value = normalizeText(item.value)
  if (!query || !value) return -1

  let score = item.priority || 0
  if (value === query) score += 10000
  else if (value.startsWith(query)) score += 7000
  else {
    const words = value.split(' ')
    if (words.some((word) => word.startsWith(query))) score += 5000
    else if (value.includes(query)) score += 3000
    else {
      const queryWords = query.split(' ')
      const allQueryWordsMatch = queryWords.every((qWord) => words.some((word) => word.startsWith(qWord)))
      if (allQueryWordsMatch) score += 2000
      else return -1
    }
  }

  if (item.type === 'Speciality') score += 1000
  else if (item.type === 'Doctor') score += 700

  score -= Math.min(value.length, 100)
  return score
}

function highlightSuggestion(value: string, query: string): string {
  const safe = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const q = query.trim()
  if (!q) return safe
  try {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return safe.replace(new RegExp(`(${escaped})`, 'ig'), '<mark>$1</mark>')
  } catch {
    return safe
  }
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const [imageSrc, setImageSrc] = useState(doctor.photoUrl || FALLBACK_DOCTOR_IMAGE)
  const bookable = canBookAppointment(doctor)

  return (
    <article className="doctor-profile-card">
      <div className="doctor-card-header">
        <div className="doctor-card-image">
          <img
            className="doctor-live-image"
            src={imageSrc}
            alt={doctor.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageSrc(FALLBACK_DOCTOR_IMAGE)}
          />
        </div>
        <div className="doctor-card-heading">
          <h3 className="doctor-card-name">{doctor.name}</h3>
          <div className="doctor-card-position">{doctor.position}</div>
          {doctor.displaySpecialities.length > 0 ? (
            <div className="doctor-card-tag">
              {doctor.displaySpecialities.map((item) => (
                <span key={item}>
                  {item}
                  <br />
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="doctor-card-department">Department of {doctor.department}</div>

      {doctor.qualifications ? (
        <div className="doctor-card-section">
          <div className="doctor-card-label">Qualifications</div>
          <div className="doctor-card-value">{doctor.qualifications}</div>
        </div>
      ) : null}

      {bookable ? (
        <div className="doctor-card-actions single-button">
          <a
            href={APPOINTMENT_URL}
            className="doctor-card-button doctor-card-appointment-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book An Appointment
          </a>
        </div>
      ) : null}
    </article>
  )
}

export function DoctorsPage({ onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [speciality, setSpeciality] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const searchBoxRef = useRef<HTMLDivElement>(null)

  const availableSpecialities = useMemo(() => {
    const set = new Set<string>()
    for (const doctor of DOCTORS) {
      for (const item of doctor.specialities) set.add(normalizeText(item))
    }
    return DOCTOR_SPECIALITIES.filter((s) => set.has(normalizeText(s.name))).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }, [])

  const doctorOptions = useMemo(() => {
    return DOCTORS.filter((doctor) => {
      if (!speciality) return true
      return doctor.specialities.some((item) => normalizeText(item) === normalizeText(speciality))
    }).sort((a, b) => doctorSortName(a.name).localeCompare(doctorSortName(b.name)))
  }, [speciality])

  const autocompleteIndex = useMemo(() => {
    const items: Suggestion[] = []
    const seen = new Set<string>()
    const add = (value: string, type: Suggestion['type'], meta: string, priority: number) => {
      const clean = value.trim()
      if (!clean) return
      const key = normalizeText(`${type}|${clean}`)
      if (seen.has(key)) return
      seen.add(key)
      items.push({ value: clean, type, meta, priority })
    }
    for (const s of DOCTOR_SPECIALITIES) add(s.name, 'Speciality', 'Speciality', 300)
    for (const d of DOCTORS) add(d.name, 'Doctor', d.department, 250)
    for (const s of DOCTOR_SPECIALITIES) {
      for (const keyword of s.keywords) add(keyword, 'Keyword', s.name, 100)
    }
    return items
  }, [])

  const suggestions = useMemo(() => {
    const query = search.trim()
    if (normalizeText(query).length < AUTOCOMPLETE_MIN_CHARS) return []
    return autocompleteIndex
      .map((item) => ({ ...item, score: getAutocompleteScore(item, query) }))
      .filter((item) => (item.score ?? -1) >= 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.value.localeCompare(b.value))
      .slice(0, AUTOCOMPLETE_MAX_RESULTS)
  }, [autocompleteIndex, search])

  useEffect(() => {
    setActiveSuggestion(0)
    setSuggestionsOpen(suggestions.length > 0 && normalizeText(search).length >= AUTOCOMPLETE_MIN_CHARS)
  }, [suggestions, search])

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!searchBoxRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  useEffect(() => {
    if (doctorName && !doctorOptions.some((d) => d.name === doctorName)) {
      setDoctorName('')
    }
  }, [doctorOptions, doctorName])

  const results = useMemo(() => {
    const scored = DOCTORS.map((doctor) => ({
      doctor,
      searchScore: search.trim() ? getSearchScore(doctor, search.trim()) : 0,
    })).filter((item) => {
      if (item.searchScore < 0) return false
      if (doctorName && normalizeText(item.doctor.name) !== normalizeText(doctorName)) return false
      if (speciality && !item.doctor.specialities.some((s) => normalizeText(s) === normalizeText(speciality))) {
        return false
      }
      return true
    })

    scored.sort((a, b) => {
      if (search.trim()) {
        const diff = b.searchScore - a.searchScore
        if (diff !== 0) return diff
      }
      return cardSort(a.doctor, b.doctor)
    })

    return scored.map((item) => item.doctor)
  }, [search, doctorName, speciality])

  const selectSuggestion = (suggestion: Suggestion) => {
    setSearch(suggestion.value)
    setSuggestionsOpen(false)
  }

  return (
    <section className="portal-page doctors-page" aria-label="Doctors">
      <div className="doctors-wrapper">
        <div className="doctors-filter-row">
          <div className="doctors-search-box" ref={searchBoxRef}>
            <span className="doctors-search-icon" aria-hidden />
            <input
              id="doctorSearch"
              type="search"
              placeholder="Search doctor, speciality, treatment..."
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls="doctorSearchSuggestions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (normalizeText(search).length >= AUTOCOMPLETE_MIN_CHARS && suggestions.length) {
                  setSuggestionsOpen(true)
                }
              }}
              onKeyDown={(e) => {
                if (!suggestionsOpen || !suggestions.length) return
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setActiveSuggestion((i) => (i + 1) % suggestions.length)
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                  e.preventDefault()
                  selectSuggestion(suggestions[Math.max(0, activeSuggestion)])
                } else if (e.key === 'Escape') {
                  setSuggestionsOpen(false)
                }
              }}
            />
            <button
              type="button"
              className={`doctors-search-clear${search.trim() ? ' show' : ''}`}
              aria-label="Clear search"
              onClick={() => {
                setSearch('')
                setSuggestionsOpen(false)
              }}
            >
              <span>&times;</span>
            </button>

            <div
              id="doctorSearchSuggestions"
              className={`doctors-search-suggestions${suggestionsOpen ? ' show' : ''}`}
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.value}`}
                  type="button"
                  role="option"
                  className={`doctors-suggestion-item${index === activeSuggestion ? ' active' : ''}`}
                  onMouseEnter={() => setActiveSuggestion(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="doctors-suggestion-icon">
                    {suggestion.type === 'Doctor' ? 'Dr' : suggestion.type === 'Speciality' ? 'S' : '⌕'}
                  </span>
                  <span className="doctors-suggestion-content">
                    <span
                      className="doctors-suggestion-value"
                      dangerouslySetInnerHTML={{ __html: highlightSuggestion(suggestion.value, search) }}
                    />
                    {suggestion.meta ? <span className="doctors-suggestion-meta">{suggestion.meta}</span> : null}
                  </span>
                  <span className="doctors-suggestion-type">
                    {suggestion.type === 'Keyword' ? 'Symptom / Treatment' : suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="doctors-doctor-filter-box">
            <select
              id="doctorNameFilter"
              value={doctorName}
              onChange={(e) => {
                setDoctorName(e.target.value)
                setSuggestionsOpen(false)
              }}
              aria-label="Find doctor"
            >
              <option value="">
                Find Doctor ({doctorOptions.length} {doctorOptions.length === 1 ? 'Doctor' : 'Doctors'})
              </option>
              {doctorOptions.map((doctor) => (
                <option key={doctor.name} value={doctor.name}>
                  {doctor.name} — {doctor.department}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`doctors-doctor-filter-clear${doctorName ? ' show' : ''}`}
              aria-label="Clear doctor"
              onClick={() => setDoctorName('')}
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="doctors-filter-box">
            <select
              id="doctorSpecialityFilter"
              value={speciality}
              onChange={(e) => {
                setSpeciality(e.target.value)
                setSuggestionsOpen(false)
              }}
              aria-label="Find speciality"
            >
              <option value="">Find Speciality</option>
              {availableSpecialities.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`doctors-filter-clear${speciality ? ' show' : ''}`}
              aria-label="Clear speciality"
              onClick={() => setSpeciality('')}
            >
              <span>&times;</span>
            </button>
          </div>

          <button type="button" className="doctors-specialities-button" onClick={() => onNavigate('speciality')}>
            All Specialities
            <span className="doctors-specialities-arrow">→</span>
          </button>
        </div>

        {results.length > 0 ? (
          <div className="doctors-grid">
            {results.map((doctor) => (
              <DoctorCard key={doctor.profilePath} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="doctors-no-results show">
            <div className="doctors-no-results-title">No Doctors Found</div>
            <div className="doctors-no-results-text">
              Try another doctor name, speciality, symptom or treatment.
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
