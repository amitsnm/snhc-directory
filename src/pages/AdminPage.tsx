import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { DirectoryEntry, DirectoryStatus } from '../types/directory'
import {
  downloadTextFile,
  entriesToCsv,
  getWorkingDirectory,
  loadAdminEntries,
  mergeImport,
  normalizeEntry,
  parseDirectoryCsv,
  saveAdminEntries,
  seedAsEntries,
  setEntryStatus,
  upsertEntry,
} from '../services/directoryAdmin'
import './AdminPage.css'

const EMPTY_FORM = {
  id: '',
  person: '',
  designation: '',
  department: '',
  zone: '',
  floor: '',
  extension: '',
  mobile: '',
  email: '',
  status: 'active' as DirectoryStatus,
}

function notifyAdminChanged() {
  window.dispatchEvent(new Event('snhc-directory-admin-changed'))
}

export function AdminPage() {
  const [entries, setEntries] = useState<DirectoryEntry[]>(() => getWorkingDirectory())
  const [form, setForm] = useState(EMPTY_FORM)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DirectoryStatus>('all')
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const flash = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(null), 3200)
  }

  const persist = (next: DirectoryEntry[]) => {
    saveAdminEntries(next)
    setEntries(next)
    notifyAdminChanged()
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries
      .filter((e) => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false
        if (!q) return true
        const hay = [e.person, e.designation, e.department, e.zone, e.floor, e.extension, e.mobile, e.email]
          .join(' ')
          .toLowerCase()
        return hay.includes(q)
      })
      .sort((a, b) => a.person.localeCompare(b.person))
  }, [entries, query, statusFilter])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.person.trim() || !form.extension.trim()) {
      flash('Name and Intercom are required')
      return
    }
    const next = upsertEntry(
      normalizeEntry({
        ...form,
        id: form.id || undefined,
      }),
      entries,
    )
    persist(next)
    setForm(EMPTY_FORM)
    flash(form.id ? `Updated ${form.person}` : `Added ${form.person}`)
  }

  const onEdit = (entry: DirectoryEntry) => {
    setForm({
      id: entry.id,
      person: entry.person,
      designation: entry.designation,
      department: entry.department,
      zone: entry.zone,
      floor: entry.floor,
      extension: entry.extension,
      mobile: entry.mobile,
      email: entry.email,
      status: entry.status,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onToggle = (entry: DirectoryEntry) => {
    const nextStatus: DirectoryStatus = entry.status === 'active' ? 'inactive' : 'active'
    persist(setEntryStatus(entry.id, nextStatus, entries))
    flash(`${entry.person} marked ${nextStatus}`)
  }

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text()
      const incoming = parseDirectoryCsv(text)
      if (!incoming.length) {
        flash('No rows found in file')
        return
      }
      const merged = mergeImport(entries.length ? entries : seedAsEntries(), incoming)
      persist(merged)
      flash(`Imported ${incoming.length} rows · ${merged.length} contacts total`)
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Import failed')
    }
  }

  const onBootstrapSeed = () => {
    const seeded = seedAsEntries()
    persist(seeded)
    flash(`Loaded ${seeded.length} seed contacts into Admin`)
  }

  const activeCount = entries.filter((e) => e.status === 'active').length
  const inactiveCount = entries.filter((e) => e.status === 'inactive').length

  return (
    <section className="portal-page admin-page" aria-label="Admin">
      <div className="admin-banner">
        <div>
          <strong>Contact Center Admin</strong>
          <p>
            Maintain Intercom Directory contacts for the front pages. Download the Excel template for the Contact
            Center team, fill it, then import here (save Excel as CSV or paste CSV).
          </p>
        </div>
        <div className="admin-banner-actions">
          <a className="admin-btn" href="/templates/SNHC_Intercom_Directory_Template.xlsx" download>
            Download Excel template
          </a>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() =>
              downloadTextFile('SNHC_Intercom_Directory.csv', entriesToCsv(entries.length ? entries : seedAsEntries()))
            }
          >
            Export CSV
          </button>
        </div>
      </div>

      {message ? (
        <div className="admin-flash" role="status">
          {message}
        </div>
      ) : null}

      <div className="admin-stats">
        <span>
          Total <strong>{entries.length}</strong>
        </span>
        <span>
          Active <strong>{activeCount}</strong>
        </span>
        <span>
          Inactive <strong>{inactiveCount}</strong>
        </span>
      </div>

      <form className="admin-form" onSubmit={onSubmit}>
        <h3>{form.id ? 'Update contact' : 'Add contact'}</h3>
        <div className="admin-form-grid">
          {(
            [
              ['person', 'Name', true],
              ['designation', 'Designation', false],
              ['department', 'Department', false],
              ['zone', 'Section', false],
              ['floor', 'Floor', false],
              ['extension', 'Intercom', true],
              ['mobile', 'Mobile', false],
              ['email', 'Email', false],
            ] as const
          ).map(([key, label, required]) => (
            <label key={key}>
              {label}
              <input
                value={form[key]}
                required={required}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as DirectoryStatus }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn">
            {form.id ? 'Update contact' : 'Add contact'}
          </button>
          {form.id ? (
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setForm(EMPTY_FORM)}>
              Cancel edit
            </button>
          ) : null}
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onBootstrapSeed}>
            Load seed into Admin
          </button>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => fileRef.current?.click()}>
            Import CSV / Excel-saved CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </form>

      <div className="admin-toolbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts…"
          aria-label="Search admin contacts"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | DirectoryStatus)}
          aria-label="Status filter"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Section</th>
              <th>Floor</th>
              <th>Intercom</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Status</th>
              <th>Maintain</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className={entry.status === 'inactive' ? 'is-inactive' : ''}>
                <td>{entry.person}</td>
                <td>{entry.designation}</td>
                <td>{entry.department}</td>
                <td>{entry.zone}</td>
                <td>{entry.floor}</td>
                <td className="mono">{entry.extension}</td>
                <td>{entry.mobile || '—'}</td>
                <td>{entry.email || '—'}</td>
                <td>
                  <span className={`admin-status status-${entry.status}`}>{entry.status}</span>
                </td>
                <td className="admin-row-actions">
                  <button type="button" onClick={() => onEdit(entry)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onToggle(entry)}>
                    {entry.status === 'active' ? 'Set Inactive' : 'Set Active'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="admin-empty">No contacts match.</p> : null}
      </div>

      {!loadAdminEntries().length ? (
        <p className="admin-hint">
          Tip: click <strong>Load seed into Admin</strong> or import the team Excel/CSV to start maintaining live
          Contact Center data. Front pages show Active contacts only.
        </p>
      ) : null}
    </section>
  )
}
