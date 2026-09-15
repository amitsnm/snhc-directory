import { useMemo, useState } from 'react'
import { compareFloors, formatFloorLabel } from '../data/locations'
import { copyText, dialExtension, formatContactCard } from '../services/ipbx'
import type { AppConfig, DirectoryEntry, ViewMode } from '../types/directory'

interface Props {
  entries: DirectoryEntry[]
  config: AppConfig
  viewMode: ViewMode
}

export function DirectoryTable({ entries, config, viewMode }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  const onDialExt = async (entry: DirectoryEntry) => {
    notify((await dialExtension(entry, config)).message)
  }

  const onCallMobile = (entry: DirectoryEntry) => {
    const mobile = entry.mobile?.trim()
    if (!mobile) {
      notify('No mobile number')
      return
    }
    window.location.href = `tel:${mobile}`
    notify(`Calling ${entry.person}`)
  }

  const onEmail = (entry: DirectoryEntry) => {
    const email = entry.email?.trim()
    if (!email) {
      notify('No email address')
      return
    }
    window.location.href = `mailto:${email}`
    notify(`Opening email to ${entry.person}`)
  }

  const onCopyExt = async (entry: DirectoryEntry) => {
    notify((await copyText('Intercom', entry.extension)).message)
  }

  const onCopyCard = async (entry: DirectoryEntry) => {
    notify((await copyText('Contact card', formatContactCard(entry))).message)
  }

  const actions = { onDialExt, onCallMobile, onEmail, onCopyExt, onCopyCard }

  const groups = useMemo(() => {
    if (viewMode === 'list' || viewMode === 'grid') return null
    const keyOf = (e: DirectoryEntry) =>
      viewMode === 'floor' ? e.floor || '—' : e.department || 'General'
    const map = new Map<string, DirectoryEntry[]>()
    for (const entry of entries) {
      const key = keyOf(entry)
      const list = map.get(key) ?? []
      list.push(entry)
      map.set(key, list)
    }
    const pairs = [...map.entries()]
    if (viewMode === 'floor') {
      return pairs
        .sort(([a], [b]) => compareFloors(a, b))
        .map(([code, people]) => [formatFloorLabel(code), people] as [string, DirectoryEntry[]])
    }
    return pairs.sort(([a], [b]) => a.localeCompare(b))
  }, [entries, viewMode])

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <h2>No matches</h2>
        <p>Try another name, extension, or clear the active filters.</p>
      </div>
    )
  }

  return (
    <>
      {viewMode === 'list' ? (
        <ListView entries={entries} {...actions} />
      ) : viewMode === 'grid' ? (
        <GridView entries={entries} {...actions} />
      ) : (
        <GroupedView groups={groups ?? []} mode={viewMode} {...actions} />
      )}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </>
  )
}

type Actions = {
  onDialExt: (e: DirectoryEntry) => void | Promise<void>
  onCallMobile: (e: DirectoryEntry) => void
  onEmail: (e: DirectoryEntry) => void
  onCopyExt: (e: DirectoryEntry) => void | Promise<void>
  onCopyCard: (e: DirectoryEntry) => void | Promise<void>
}

function toSentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return value
  const lower = trimmed.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function ActionIcons({ entry, onDialExt, onCallMobile, onEmail, onCopyCard }: { entry: DirectoryEntry } & Actions) {
  return (
    <div className="contact-actions">
      <button
        type="button"
        className="contact-action"
        title="Dial intercom"
        disabled={!entry.extension}
        onClick={() => void onDialExt(entry)}
      >
        ⌕
      </button>
      <button
        type="button"
        className="contact-action"
        title="Call mobile"
        disabled={!entry.mobile}
        onClick={() => onCallMobile(entry)}
      >
        ☎
      </button>
      <button
        type="button"
        className="contact-action"
        title="Send email"
        disabled={!entry.email}
        onClick={() => onEmail(entry)}
      >
        ✉
      </button>
      <button type="button" className="contact-action" title="Copy contact card" onClick={() => void onCopyCard(entry)}>
        ⎘
      </button>
    </div>
  )
}

function ListView({ entries, ...actions }: { entries: DirectoryEntry[] } & Actions) {
  return (
    <div className="list-view list-view-wide" aria-label="List view">
      <div className="list-head list-head-wide">
        <span>Name</span>
        <span>Designation</span>
        <span>Department</span>
        <span>Section</span>
        <span>Floor</span>
        <span>Intercom</span>
        <span>Mobile</span>
        <span>Email</span>
        <span>Actions</span>
      </div>
      <ul className="list-body">
        {entries.map((entry) => (
          <li key={entry.id} className="list-row list-row-wide">
            <div className="list-name">
              <strong>{entry.person}</strong>
            </div>
            <span className="list-desig">{entry.designation || '—'}</span>
            <span className="list-dept">{entry.department}</span>
            <span className="list-zone">{entry.zone || '—'}</span>
            <span className="list-floor">{formatFloorLabel(entry.floor)}</span>
            <button
              type="button"
              className="list-ext"
              onClick={() => void actions.onCopyExt(entry)}
              title="Copy intercom"
            >
              {entry.extension || '—'}
            </button>
            <span className="list-mobile">{entry.mobile || '—'}</span>
            <span className="list-email" title={entry.email || undefined}>
              {entry.email || '—'}
            </span>
            <ActionIcons entry={entry} {...actions} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function GridView({ entries, ...actions }: { entries: DirectoryEntry[] } & Actions) {
  return (
    <div className="grid-view" aria-label="Grid view">
      {entries.map((entry) => (
        <article key={entry.id} className="grid-card">
          <header className="grid-card-top">
            <h2>{entry.person}</h2>
            <button
              type="button"
              className="extn-num"
              onClick={() => void actions.onCopyExt(entry)}
              title="Copy intercom"
            >
              {entry.extension}
            </button>
          </header>
          <p className="grid-dept">{toSentenceCase(entry.department)}</p>
          <p className="grid-meta">
            {entry.designation && entry.designation !== 'Staff' ? `${entry.designation} · ` : ''}
            {formatFloorLabel(entry.floor)}
            {entry.zone ? ` · ${entry.zone}` : ''}
          </p>
          <p className="grid-meta">
            {entry.mobile ? `Mobile ${entry.mobile}` : 'No mobile'}
            {entry.email ? ` · ${entry.email}` : ''}
          </p>
          <ActionIcons entry={entry} {...actions} />
        </article>
      ))}
    </div>
  )
}

function GroupedView({
  groups,
  mode,
  ...actions
}: {
  groups: [string, DirectoryEntry[]][]
  mode: ViewMode
} & Actions) {
  return (
    <div className={`grouped-view grouped-${mode}`} aria-label={`${mode} view`}>
      {groups.map(([title, people]) => (
        <section key={title} className="group-section">
          <h2 className="group-title">
            <span>{title}</span>
            <span className="group-count">{people.length}</span>
          </h2>
          <ul className="extn-rows">
            {people.map((entry) => (
              <li key={entry.id} className="extn-row extn-row-rich">
                <div className="extn-name-block">
                  <span className="extn-name">{entry.person}</span>
                  <span className="extn-loc">
                    {entry.designation && entry.designation !== 'Staff' ? `${entry.designation} · ` : ''}
                    {mode === 'floor'
                      ? entry.department
                      : `${formatFloorLabel(entry.floor)}${entry.zone ? ` · ${entry.zone}` : ''}`}
                    {entry.mobile ? ` · ${entry.mobile}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="extn-num"
                  onClick={() => void actions.onCopyExt(entry)}
                  title="Copy intercom"
                >
                  {entry.extension}
                </button>
                <ActionIcons entry={entry} {...actions} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
