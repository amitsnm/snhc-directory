import { useMemo } from 'react'
import serviceMaster from '../data/service-master.json' with { type: 'json' }
import type { ServiceMasterItem } from '../types/services'

const ALL = serviceMaster as ServiceMasterItem[]

export function SpecialityPage() {
  const specialities = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of ALL) {
      const name = row.department?.trim()
      if (!name) continue
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [])

  return (
    <section className="portal-page speciality-page" aria-label="Speciality">
      <div className="speciality-grid">
        {specialities.map(([name, count]) => (
          <article key={name} className="speciality-card">
            <h3>{name}</h3>
            <p>{count} linked service{count === 1 ? '' : 's'}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
