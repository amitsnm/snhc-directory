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
    status: 'active',
    ldapDn: row.dn,
    updatedAt: row.whenChanged ?? new Date().toISOString(),
  }
}

/**
 * Fetches directory from LDAP gateway API.
 * When no real LDAP gateway is configured, uses the Apps Script–sourced seed
 * so Intercom Directory stays populated offline-first.
 */
export async function fetchFromLdap(
  config: AppConfig,
  signal?: AbortSignal,
): Promise<{ entries: DirectoryEntry[]; live: boolean }> {
  if (!navigator.onLine) {
    return { entries: [], live: false }
  }

  const ldapConfigured =
    Boolean(import.meta.env.VITE_LDAP_URL) &&
    !config.ldapUrl.includes('ldap.local')

  if (!ldapConfigured) {
    await delay(200, signal)
    return {
      entries: SEED_DIRECTORY.map((e) => ({
        ...e,
        updatedAt: new Date().toISOString(),
      })),
      live: true,
    }
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
