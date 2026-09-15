import type { AppConfig, DirectoryEntry } from '../types/directory'
import snhcDirectory from './snhc-directory.json' with { type: 'json' }

export const DEFAULT_CONFIG: AppConfig = {
  ldapUrl: import.meta.env.VITE_LDAP_URL ?? 'https://ldap.local/api/directory',
  ldapBaseDn: import.meta.env.VITE_LDAP_BASE_DN ?? 'ou=People,dc=snhc,dc=local',
  ipbxUrl: import.meta.env.VITE_IPBX_URL ?? 'https://ipbx.local/api/originate',
  ipbxApiKey: import.meta.env.VITE_IPBX_API_KEY ?? '',
  syncIntervalMs: Number(import.meta.env.VITE_SYNC_INTERVAL_MS ?? 60_000),
}

/** Header strip — SNHC Extension Directory (Apps Script, as on 05-Sep-2026) */
export const COMPLEX_META = {
  asOn: '05-Sep-2026',
  reception: '1500',
  epabx: '',
  fax: '',
} as const

export type EmergencyCodeKind = 'clinical' | 'admin'

export interface EmergencyCode {
  id: string
  name: string
  meaning: string
  extension: string
  color: string
  kind: EmergencyCodeKind
}

/**
 * Official SNHC emergency telephone codes from CODES Circular
 * (Clinical + Non-Clinical / Administrative collective response).
 */
export const EMERGENCY_CODES: EmergencyCode[] = [
  {
    id: 'blue',
    name: 'Blue',
    meaning: 'CPR – Adult / Pediatric / Neonate',
    extension: '5000',
    color: '#1565c0',
    kind: 'clinical',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    meaning: 'STEMI',
    extension: '5111',
    color: '#3949ab',
    kind: 'clinical',
  },
  {
    id: 'grey',
    name: 'Grey',
    meaning: 'Stroke',
    extension: '5222',
    color: '#616161',
    kind: 'clinical',
  },
  {
    id: 'orange',
    name: 'Orange',
    meaning: 'Poly-Trauma',
    extension: '5333',
    color: '#ef6c00',
    kind: 'clinical',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    meaning: 'Disaster',
    extension: '5444',
    color: '#c79100',
    kind: 'clinical',
  },
  {
    id: 'pink',
    name: 'Pink',
    meaning: 'Child Abduction',
    extension: '5666',
    color: '#ad1457',
    kind: 'clinical',
  },
  {
    id: 'black',
    name: 'Black',
    meaning: 'Death',
    extension: '5777',
    color: '#212121',
    kind: 'clinical',
  },
  {
    id: 'red',
    name: 'Red',
    meaning: 'Fire',
    extension: '6000',
    color: '#c62828',
    kind: 'admin',
  },
  {
    id: 'violet',
    name: 'Violet',
    meaning: 'Violence',
    extension: '6111',
    color: '#6a1b9a',
    kind: 'admin',
  },
  {
    id: 'brown',
    name: 'Brown',
    meaning: 'Bomb Threat',
    extension: '6222',
    color: '#5d4037',
    kind: 'admin',
  },
]

/** Quick dial — extensions from SNHC Apps Script / directory (not dummy). */
export const HELPDESK_CONTACTS = [
  { id: 'it', name: 'IT Helpdesk', extension: '1559' },
  { id: 'reception', name: 'Main Reception', extension: '1500' },
  { id: 'helpdesk', name: 'H24 Help', extension: '1500' },
  { id: 'fire', name: 'Fire Control', extension: '1099' },
  { id: 'er', name: 'ER Reception', extension: '1080' },
  { id: 'contact', name: 'Contact Centre', extension: '1670' },
  { id: 'security', name: 'Security', extension: '1598' },
  { id: 'pharmacy', name: 'OPD Pharmacy', extension: '1161' },
] as const

/** Seed from hospital Apps Script Extension Directory — offline-first */
export const SEED_DIRECTORY: DirectoryEntry[] = (snhcDirectory as Array<Partial<DirectoryEntry>>).map(
  (row, index) => ({
    id: row.id ?? `seed-${index + 1}`,
    person: row.person ?? 'Unknown',
    designation: row.designation ?? '—',
    department: row.department ?? '—',
    floor: row.floor ?? '—',
    zone: row.zone ?? '—',
    email: row.email ?? '',
    mobile: row.mobile ?? '',
    extension: row.extension ?? '',
    status: row.status === 'inactive' ? 'inactive' : 'active',
    ldapDn: row.ldapDn,
    updatedAt: row.updatedAt ?? '2026-09-05T00:00:00.000Z',
  }),
)

/** Public Apps Script web app used as the live directory source of truth. */
export const APPS_SCRIPT_DIRECTORY_URL =
  'https://script.google.com/macros/s/AKfycbzySdeUADo7lWCGsuCANCYzMJ-pEMIKQywbUjz9zLP_giqNuyienmwsdW354uNeu7C8/exec'
