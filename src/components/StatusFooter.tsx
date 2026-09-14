import type { SyncStatus } from '../types/directory'

function StatusDot({ state }: { state: SyncStatus['ldap'] }) {
  const label =
    state === 'online'
      ? 'Live'
      : state === 'syncing'
        ? 'Syncing'
        : state === 'offline'
          ? 'Offline'
          : 'Error'
  return (
    <span className={`status-pill status-${state}`} title={label}>
      <span className="status-dot" aria-hidden />
      {label}
    </span>
  )
}

function formatLastSync(iso: string | null): string {
  const d = iso ? new Date(iso) : null
  if (!d || Number.isNaN(d.getTime())) return '05-Sep-2026 00:00:00'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dd = String(d.getDate()).padStart(2, '0')
  const mon = months[d.getMonth()]
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${dd}-${mon}-${yyyy} ${hh}:${mm}:${ss}`
}

interface Props {
  status: SyncStatus
  onRefresh: () => void
}

export function StatusFooter({ status, onRefresh }: Props) {
  return (
    <footer className="status-footer" aria-label="Sync and connection status">
      <div className="status-footer-inner">
        <div className="status-footer-meta">
          <span className="header-stat">
            <span className="conn-label">LDAP :</span>
            <StatusDot state={status.ldap} />
          </span>
          <span className="header-stat">
            <span className="conn-label">IPBX :</span>
            <StatusDot state={status.ipbx} />
          </span>
          <span className="header-stat">
            <span className="conn-label">Contacts :</span>
            <span className="header-stat-value">
              {status.entryCount}
              {status.source === 'cache' ? ' · Cached' : ' · Live'}
            </span>
          </span>
          <span className="header-stat">
            <span className="conn-label">Last Sync :</span>
            <span className="header-stat-value">{formatLastSync(status.lastSyncedAt)}</span>
          </span>
        </div>
        <button
          type="button"
          className="btn-header"
          onClick={onRefresh}
          disabled={status.ldap === 'syncing'}
        >
          Refresh
        </button>
      </div>
    </footer>
  )
}
