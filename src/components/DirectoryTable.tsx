import { useMemo, useState } from 'react'
import { compareFloors, formatFloorLabel } from '../data/locations'
import { copyText } from '../services/ipbx'
import type { DirectoryEntry, ViewMode } from '../types/directory'

interface Props {
  entries: DirectoryEntry[]
  config: unknown
  viewMode: ViewMode
}

export function DirectoryTable({ entries, viewMode }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  // Dial / Copy contact actions temporarily disabled
  // const onDial = async (entry: DirectoryEntry) => { ... }
  // const onCopyCard = async (entry: DirectoryEntry) => { ... }

  const onCopyExt = async (entry: DirectoryEntry) => {
    notify((await copyText('Extension', entry.extension)).message)
  }

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
        <ListView entries={entries} onCopyExt={onCopyExt} />
      ) : viewMode === 'grid' ? (
        <GridView entries={entries} onCopyExt={onCopyExt} />
      ) : (
        <GroupedView groups={groups ?? []} mode={viewMode} onCopyExt={onCopyExt} />
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
  onCopyExt: (e: DirectoryEntry) => void | Promise<void>
}

function toSentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return value
  const lower = trimmed.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function ListView({ entries, onCopyExt }: { entries: DirectoryEntry[] } & Actions) {
  return (
    <div className="list-view" aria-label="List view">
      <div className="list-head">
        <span>Name</span>
        <span>Department</span>
        <span>Floor</span>
        <span>Zone</span>
        <span>Ext</span>
        {/* <span>Dial</span> */}
        {/* <span>Copy</span> */}
      </div>
      <ul className="list-body">
        {entries.map((entry) => (
          <li key={entry.id} className="list-row">
            <div className="list-name">
              <strong>{entry.person}</strong>
              {entry.designation && entry.designation !== 'Staff' ? (
                <span>{entry.designation}</span>
              ) : null}
            </div>
            <span className="list-dept">{entry.department}</span>
            <span className="list-floor">{formatFloorLabel(entry.floor)}</span>
            <span className="list-zone">{entry.zone || '—'}</span>
            <button type="button" className="list-ext" onClick={() => void onCopyExt(entry)} title="Copy extension">
              {entry.extension}
            </button>
            {/* Dial / Copy buttons commented out
            <button type="button" className="btn-primary list-dial">Dial</button>
            <button type="button" className="btn-secondary list-copy">Copy</button>
            */}
          </li>
        ))}
      </ul>
    </div>
  )
}

function GridView({ entries, onCopyExt }: { entries: DirectoryEntry[] } & Actions) {
  return (
    <div className="grid-view" aria-label="Grid view">
      {entries.map((entry) => (
        <article key={entry.id} className="grid-card">
          <header className="grid-card-top">
            <h2>{entry.person}</h2>
            <button type="button" className="extn-num" onClick={() => void onCopyExt(entry)} title="Copy extension">
              {entry.extension}
            </button>
          </header>
          <p className="grid-dept">{toSentenceCase(entry.department)}</p>
          <p className="grid-meta">
            {formatFloorLabel(entry.floor)}
            {entry.zone ? ` · ${entry.zone}` : ''}
            {entry.designation && entry.designation !== 'Staff' ? ` · ${entry.designation}` : ''}
          </p>
          {/* Dial / Copy actions commented out */}
        </article>
      ))}
    </div>
  )
}

function GroupedView({
  groups,
  mode,
  onCopyExt,
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
              <li key={entry.id} className="extn-row">
                <div className="extn-name-block">
                  <span className="extn-name">{entry.person}</span>
                  {mode === 'floor' ? (
                    <span className="extn-loc">{entry.department}</span>
                  ) : (
                    <span className="extn-loc">
                      {formatFloorLabel(entry.floor)}
                      {entry.zone ? ` · ${entry.zone}` : ''}
                    </span>
                  )}
                </div>
                <button type="button" className="extn-num" onClick={() => void onCopyExt(entry)} title="Copy extension">
                  {entry.extension}
                </button>
                {/* Dial / Copy actions commented out */}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
