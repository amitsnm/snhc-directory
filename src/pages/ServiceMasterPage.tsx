import { useMemo, useState } from 'react'
import serviceMaster from '../data/service-master.json' with { type: 'json' }
import type { ServiceMasterItem } from '../types/services'

const ALL = serviceMaster as ServiceMasterItem[]

interface Props {
  title?: string
  presetTypes?: string[]
}

export function ServiceMasterPage({ title = 'Service Master', presetTypes }: Props) {
  const [query, setQuery] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [department, setDepartment] = useState('')

  const types = useMemo(() => {
    const base = presetTypes?.length
      ? presetTypes
      : [...new Set(ALL.map((r) => r.serviceType).filter(Boolean))].sort()
    return base
  }, [presetTypes])

  const departments = useMemo(
    () =>
      [...new Set(ALL.map((r) => r.department).filter(Boolean))]
        .filter((d) => {
          if (!presetTypes?.length) return true
          return ALL.some((r) => r.department === d && presetTypes.includes(r.serviceType))
        })
        .sort(),
    [presetTypes],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL.filter((row) => {
      if (presetTypes?.length && !presetTypes.includes(row.serviceType)) return false
      if (serviceType && row.serviceType !== serviceType) return false
      if (department && row.department !== department) return false
      if (q.length >= 2) {
        const hay = [row.serviceItem, row.code, row.department, row.serviceType, row.billingCategory]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [query, serviceType, department, presetTypes])

  const hasActiveSearch = query.trim().length >= 2 || Boolean(serviceType) || Boolean(department)
  /** Unfiltered catalogue is huge — cap browse mode only; searches show every match. */
  const BROWSE_LIMIT = 1000
  const visible = hasActiveSearch ? filtered : filtered.slice(0, BROWSE_LIMIT)
  const totalMatching = filtered.length

  return (
    <section className="portal-page service-master-page" aria-label={title}>
      <div className="toolbar service-toolbar">
        <input
          type="search"
          className="toolbar-search"
          placeholder="Search service, code, department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search services"
        />
        <select
          className="toolbar-select toolbar-select-wide"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          aria-label="Service type"
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="toolbar-select toolbar-select-wide"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          aria-label="Department"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="toolbar-count">
          Showing <strong>{visible.length}</strong>
          {totalMatching > visible.length ? ` of ${totalMatching}` : ''} services
          {!hasActiveSearch && totalMatching > visible.length
            ? ' — search or filter to see all matching rows'
            : ''}
        </p>
      </div>

      <div className="table-wrap service-table-wrap">
        <table className="directory-table service-table">
          <thead>
            <tr>
              <th>Service Item</th>
              <th>Code</th>
              <th>Type</th>
              <th>Department</th>
              <th>Billing</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, idx) => (
              <tr key={`${row.code}-${row.billingCategory}-${row.price}-${idx}`}>
                <td className="cell-person">{row.serviceItem}</td>
                <td>{row.code || '—'}</td>
                <td>{row.serviceType || '—'}</td>
                <td>{row.department || '—'}</td>
                <td>{row.billingCategory || '—'}</td>
                <td className="price-cell">
                  {row.price != null ? `₹${Number(row.price).toLocaleString('en-IN')}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <div className="empty-state">
            <h2>No services found</h2>
            <p>Try another search or clear the filters.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
