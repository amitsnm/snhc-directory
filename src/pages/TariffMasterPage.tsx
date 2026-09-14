import { useEffect, useMemo, useState } from 'react'
import type { TariffMasterItem } from '../types/services'

const TARIFF_URL = '/data/tariff-master.json'

interface Props {
  title?: string
  presetTypes?: string[]
}

export function TariffMasterPage({ title = 'Tariff Master', presetTypes }: Props) {
  const [rows, setRows] = useState<TariffMasterItem[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [query, setQuery] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(TARIFF_URL, { cache: 'force-cache' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as TariffMasterItem[]
        if (!cancelled) {
          setRows(Array.isArray(data) ? data : [])
          setLoadState('ready')
        }
      } catch {
        if (!cancelled) {
          setRows([])
          setLoadState('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const types = useMemo(() => {
    const base = presetTypes?.length
      ? presetTypes
      : [...new Set(rows.map((r) => r.serviceType).filter(Boolean))].sort()
    return base
  }, [presetTypes, rows])

  const departments = useMemo(
    () =>
      [...new Set(rows.map((r) => r.department).filter(Boolean))]
        .filter((d) => {
          if (!presetTypes?.length) return true
          return rows.some((r) => r.department === d && presetTypes.includes(r.serviceType))
        })
        .sort(),
    [presetTypes, rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((row) => {
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
  }, [rows, query, serviceType, department, presetTypes])

  const hasActiveSearch = query.trim().length >= 2 || Boolean(serviceType) || Boolean(department)
  const BROWSE_LIMIT = 1000
  const visible = hasActiveSearch ? filtered : filtered.slice(0, BROWSE_LIMIT)
  const totalMatching = filtered.length

  return (
    <section className="portal-page tariff-master-page" aria-label={title}>
      <div className="toolbar service-toolbar">
        <input
          type="search"
          className="toolbar-search"
          placeholder="Search item, code, department…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search tariff items"
          disabled={loadState !== 'ready'}
        />
        <select
          className="toolbar-select toolbar-select-wide"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          aria-label="Service type"
          disabled={loadState !== 'ready'}
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
          disabled={loadState !== 'ready'}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <p className="toolbar-count">
          {loadState === 'loading'
            ? 'Loading tariff master…'
            : loadState === 'error'
              ? 'Could not load tariff master'
              : <>
                  Showing <strong>{visible.length}</strong>
                  {totalMatching > visible.length ? ` of ${totalMatching}` : ''} items
                  {!hasActiveSearch && totalMatching > visible.length
                    ? ' — search or filter to see all matching rows'
                    : ''}
                </>}
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
        {loadState === 'ready' && visible.length === 0 ? (
          <div className="empty-state">
            <h2>No tariff items found</h2>
            <p>Try another search or clear the filters.</p>
          </div>
        ) : null}
        {loadState === 'error' ? (
          <div className="empty-state">
            <h2>Tariff Master unavailable</h2>
            <p>Refresh the page, or check that the tariff data file is deployed.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** @deprecated Use TariffMasterPage */
export const ServiceMasterPage = TariffMasterPage
