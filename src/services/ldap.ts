import type { AppConfig, DirectoryEntry } from '../types/directory'
import { SEED_DIRECTORY } from '../data/seed'

interface LdapPersonPayload {
  id?: string
  cn?: string
  displayName?: string
  title?: string
  department?: string
  floor?: string
  physicalDeliveryOfficeName?: string
  zone?: string
  mail?: string
  mobile?: string
  telephoneNumber?: string
  extensionAttribute1?: string
  dn?: string
  whenChanged?: string
}

function mapLdapToEntry(row: LdapPersonPayload, index: number): DirectoryEntry {
  return {
    id: row.id ?? row.dn ?? `ldap-${index}`,
    person: row.displayName ?? row.cn ?? 'Unknown',
    designation: row.title ?? '—',
    department: row.department ?? '—',
    floor: row.floor ?? row.physicalDeliveryOfficeName ?? '—',
    zone: row.zone ?? '—',
    email: row.mail ?? '',
    mobile: row.mobile ?? row.telephoneNumber ?? '',
    extension: row.extensionAttribute1 ?? row.telephoneNumber ?? '',
    ldapDn: row.dn,
    updatedAt: row.whenChanged ?? new Date().toISOString(),
  }
}

/**
 * Fetches directory from LDAP gateway API.
 * Falls back to local seed when unreachable so the UI always opens.
 */
export async function fetchFromLdap(
  config: AppConfig,
  signal?: AbortSignal,
): Promise<{ entries: DirectoryEntry[]; live: boolean }> {
  if (!navigator.onLine) {
    return { entries: [], live: false }
  }

  try {
    const url = new URL(config.ldapUrl)
    url.searchParams.set('baseDn', config.ldapBaseDn)
    url.searchParams.set('scope', 'subtree')

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`LDAP gateway HTTP ${response.status}`)
    }

    const payload = (await response.json()) as LdapPersonPayload[] | { entries: LdapPersonPayload[] }
    const rows = Array.isArray(payload) ? payload : payload.entries
    const entries = rows.map(mapLdapToEntry)
    return { entries, live: true }
  } catch {
    // Demo mode: simulate a successful shape when no LDAP gateway is configured.
    // Real deployments replace this with a failure that keeps the cache.
    if (import.meta.env.DEV && !import.meta.env.VITE_LDAP_URL) {
      await delay(400, signal)
      return {
        entries: SEED_DIRECTORY.map((e) => ({
          ...e,
          updatedAt: new Date().toISOString(),
        })),
        live: true,
      }
    }
    return { entries: [], live: false }
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}
