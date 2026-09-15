import type { DirectoryEntry, DirectoryStatus } from '../types/directory'
import { DIRECTORY_IMPORT_HEADERS } from '../types/directory'
import { SEED_DIRECTORY } from '../data/seed'

const ADMIN_KEY = 'snhc-directory-admin-v1'
const ADMIN_FLAG = 'snhc-directory-admin-enabled'

export function normalizeEntry(raw: Partial<DirectoryEntry> & { person?: string }): DirectoryEntry {
  const statusRaw = String(raw.status ?? 'active').toLowerCase()
  const status: DirectoryStatus = statusRaw === 'inactive' || statusRaw === 'disabled' ? 'inactive' : 'active'
  return {
    id: raw.id || `dir-${crypto.randomUUID?.() ?? String(Date.now())}`,
    person: String(raw.person ?? '').trim() || 'Unknown',
    designation: String(raw.designation ?? '').trim() || '—',
    department: String(raw.department ?? '').trim() || '—',
    floor: String(raw.floor ?? '').trim() || '—',
    zone: String(raw.zone ?? '').trim() || '—',
    email: String(raw.email ?? '').trim(),
    mobile: String(raw.mobile ?? '').trim(),
    extension: String(raw.extension ?? '').trim(),
    status,
    ldapDn: raw.ldapDn,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

export function seedAsEntries(): DirectoryEntry[] {
  return SEED_DIRECTORY.map((e) => normalizeEntry({ ...e, status: e.status ?? 'active' }))
}

export function isAdminDirectoryEnabled(): boolean {
  return localStorage.getItem(ADMIN_FLAG) === '1' || loadAdminEntries().length > 0
}

export function loadAdminEntries(): DirectoryEntry[] {
  try {
    const raw = localStorage.getItem(ADMIN_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DirectoryEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed.map((e) => normalizeEntry(e))
  } catch {
    return []
  }
}

export function saveAdminEntries(entries: DirectoryEntry[]): void {
  const normalized = entries.map((e) => normalizeEntry(e))
  localStorage.setItem(ADMIN_KEY, JSON.stringify(normalized))
  localStorage.setItem(ADMIN_FLAG, '1')
}

export function getWorkingDirectory(): DirectoryEntry[] {
  const admin = loadAdminEntries()
  if (admin.length > 0 || localStorage.getItem(ADMIN_FLAG) === '1') {
    return admin.length > 0 ? admin : []
  }
  return seedAsEntries()
}

export function upsertEntry(entry: DirectoryEntry, list: DirectoryEntry[]): DirectoryEntry[] {
  const next = normalizeEntry({ ...entry, updatedAt: new Date().toISOString() })
  const idx = list.findIndex((e) => e.id === next.id)
  if (idx === -1) return [next, ...list]
  const copy = [...list]
  copy[idx] = next
  return copy
}

export function setEntryStatus(id: string, status: DirectoryStatus, list: DirectoryEntry[]): DirectoryEntry[] {
  return list.map((e) =>
    e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e,
  )
}

function headerIndex(headers: string[], name: string): number {
  const want = name.trim().toLowerCase()
  return headers.findIndex((h) => h.trim().toLowerCase() === want)
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

export function parseDirectoryCsv(text: string): DirectoryEntry[] {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0])
  const iName = headerIndex(headers, 'Name')
  const iDesig = headerIndex(headers, 'Designation')
  const iDept = headerIndex(headers, 'Department')
  const iSection = headerIndex(headers, 'Section')
  const iFloor = headerIndex(headers, 'Floor')
  const iExt = headerIndex(headers, 'Intercom')
  const iMobile = headerIndex(headers, 'Mobile')
  const iEmail = headerIndex(headers, 'Email')
  const iStatus = headerIndex(headers, 'Status')

  if (iName < 0 || iExt < 0) {
    throw new Error('CSV must include Name and Intercom columns')
  }

  const rows: DirectoryEntry[] = []
  for (let r = 1; r < lines.length; r++) {
    const cols = parseCsvLine(lines[r])
    const person = cols[iName] || ''
    const extension = cols[iExt] || ''
    if (!person && !extension) continue
    rows.push(
      normalizeEntry({
        id: `import-${r}-${extension || person}`.replace(/\s+/g, '-').toLowerCase(),
        person,
        designation: iDesig >= 0 ? cols[iDesig] : '',
        department: iDept >= 0 ? cols[iDept] : '',
        zone: iSection >= 0 ? cols[iSection] : '',
        floor: iFloor >= 0 ? cols[iFloor] : '',
        extension,
        mobile: iMobile >= 0 ? cols[iMobile] : '',
        email: iEmail >= 0 ? cols[iEmail] : '',
        status: (() => {
          const raw = (iStatus >= 0 ? cols[iStatus] : 'active').toLowerCase()
          return raw === 'inactive' || raw === 'disabled' ? 'inactive' : 'active'
        })(),
      }),
    )
  }
  return rows
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function entriesToCsv(entries: DirectoryEntry[]): string {
  const lines = [DIRECTORY_IMPORT_HEADERS.join(',')]
  for (const e of entries) {
    lines.push(
      [
        e.person,
        e.designation,
        e.department,
        e.zone,
        e.floor,
        e.extension,
        e.mobile,
        e.email,
        e.status === 'inactive' ? 'Inactive' : 'Active',
      ]
        .map((v) => csvEscape(String(v ?? '')))
        .join(','),
    )
  }
  return lines.join('\r\n')
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function mergeImport(existing: DirectoryEntry[], incoming: DirectoryEntry[]): DirectoryEntry[] {
  const map = new Map<string, DirectoryEntry>()
  for (const e of existing) {
    const key = `${e.extension}|${e.person}`.toLowerCase()
    map.set(key, e)
  }
  for (const e of incoming) {
    const key = `${e.extension}|${e.person}`.toLowerCase()
    const prev = map.get(key)
    map.set(key, normalizeEntry({ ...prev, ...e, id: prev?.id ?? e.id }))
  }
  return [...map.values()].sort((a, b) => a.person.localeCompare(b.person))
}
