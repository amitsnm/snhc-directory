import type { AppConfig, DirectoryEntry } from '../types/directory'
import snhcDirectory from './snhc-directory.json' with { type: 'json' }

export const DEFAULT_CONFIG: AppConfig = {
  ldapUrl: import.meta.env.VITE_LDAP_URL ?? 'https://ldap.local/api/directory',
  ldapBaseDn: import.meta.env.VITE_LDAP_BASE_DN ?? 'ou=People,dc=snhc,dc=local',
  ipbxUrl: import.meta.env.VITE_IPBX_URL ?? 'https://ipbx.local/api/originate',
  ipbxApiKey: import.meta.env.VITE_IPBX_API_KEY ?? '',
  syncIntervalMs: Number(import.meta.env.VITE_SYNC_INTERVAL_MS ?? 60_000),
}

/** Header strip — SNHC Extension Directory (as on 25-Aug-2026) */
export const COMPLEX_META = {
  asOn: '25-Aug-2026',
  reception: '1100, 1500',
  epabx: '',
  fax: '',
} as const

/** Hospital emergency codes — demo extensions (4-digit) */
export const EMERGENCY_CODES = [
  { id: 'blue', name: 'Blue', meaning: 'Cardiac / respiratory arrest', extension: '2222', color: '#1565c0' },
  { id: 'red', name: 'Red', meaning: 'Fire', extension: '3333', color: '#c62828' },
  { id: 'pink', name: 'Pink', meaning: 'Infant / child abduction', extension: '4444', color: '#ad1457' },
  { id: 'orange', name: 'Orange', meaning: 'Hazardous materials / decontamination', extension: '5555', color: '#ef6c00' },
  { id: 'yellow', name: 'Yellow', meaning: 'Missing patient / facility alert', extension: '6666', color: '#c79100' },
  { id: 'black', name: 'Black', meaning: 'Bomb threat / severe weather', extension: '7777', color: '#2a2a2a' },
  { id: 'purple', name: 'Purple', meaning: 'Security / hostage situation', extension: '8888', color: '#6a1b9a' },
  { id: 'silver', name: 'Silver', meaning: 'Active shooter / weapon', extension: '9999', color: '#607d8b' },
] as const

/** Quick dial / helpdesk — from SNHC Directory 25-Aug-2026 */
export const HELPDESK_CONTACTS = [
  { id: 'it', name: 'IT Helpdesk', extension: '1559' },
  { id: 'reception', name: 'Main Reception', extension: '1100' },
  { id: 'helpdesk', name: 'H24 Help', extension: '1500' },
  { id: 'fire', name: 'Fire Control', extension: '1099' },
  { id: 'er', name: 'ER Reception', extension: '1080' },
  { id: 'contact', name: 'Contact Centre', extension: '1670' },
  { id: 'security', name: 'Security', extension: '1598' },
  { id: 'pharmacy', name: 'OPD Pharmacy', extension: '1161' },
] as const

/** Seed from SNHC Directory 20260825.pdf — offline-first */
export const SEED_DIRECTORY: DirectoryEntry[] = snhcDirectory as DirectoryEntry[]
