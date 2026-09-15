import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEPARTMENTS,
  FLOORS,
  departmentsForLocation,
  sortFloors,
  zonesForFloor,
} from '../data/locations'
import { DEFAULT_CONFIG } from '../data/seed'
import { getLastSyncedAt } from '../services/cache'
import {
  getWorkingDirectory,
  isAdminDirectoryEnabled,
  seedAsEntries,
} from '../services/directoryAdmin'
import { fetchFromLdap } from '../services/ldap'
import { saveCachedEntries } from '../services/cache'
import type { DirectoryEntry, DirectoryFilters, SyncStatus } from '../types/directory'

const EMPTY_FILTERS: DirectoryFilters = {
  query: '',
  floor: '',
  zone: '',
  department: '',
  designation: '',
}

export function useDirectory(options?: { includeInactive?: boolean }) {
  const includeInactive = options?.includeInactive ?? false
  const [entries, setEntries] = useState<DirectoryEntry[]>([])
  const [filters, setFilters] = useState<DirectoryFilters>(EMPTY_FILTERS)
  const [status, setStatus] = useState<SyncStatus>({
    ldap: 'syncing',
    ipbx: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
    lastSyncedAt: null,
    source: 'cache',
    entryCount: 0,
  })
  const [ready, setReady] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const booted = useRef(false)

  const sync = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const working = getWorkingDirectory()
    const last = await getLastSyncedAt()
    setEntries(working)
    setReady(true)

    if (isAdminDirectoryEnabled()) {
      setStatus({
        ldap: navigator.onLine ? 'online' : 'offline',
        ipbx: navigator.onLine ? 'online' : 'offline',
        lastSyncedAt: last ?? new Date().toISOString(),
        source: 'admin',
        entryCount: working.length,
      })
      return
    }

    setStatus((s) => ({
      ...s,
      source: 'cache',
      entryCount: working.length,
      lastSyncedAt: last ?? s.lastSyncedAt,
      ldap: navigator.onLine ? 'syncing' : 'offline',
      ipbx: navigator.onLine ? 'online' : 'offline',
    }))

    if (!navigator.onLine) {
      setStatus((s) => ({ ...s, ldap: 'offline', ipbx: 'offline', source: 'cache' }))
      return
    }

    const { entries: live, live: ok } = await fetchFromLdap(DEFAULT_CONFIG, controller.signal)
    if (controller.signal.aborted) return

    if (ok && live.length > 0 && !isAdminDirectoryEnabled()) {
      const normalized = live.map((e) => ({ ...e, status: e.status ?? ('active' as const) }))
      await saveCachedEntries(normalized)
      setEntries(normalized.length ? normalized : seedAsEntries())
      setStatus({
        ldap: 'online',
        ipbx: 'online',
        lastSyncedAt: new Date().toISOString(),
        source: 'live',
        entryCount: normalized.length,
      })
    } else {
      setEntries(getWorkingDirectory())
      setStatus((s) => ({
        ...s,
        ldap: ok ? 'online' : 'error',
        ipbx: navigator.onLine ? 'online' : 'offline',
        source: isAdminDirectoryEnabled() ? 'admin' : 'cache',
        entryCount: getWorkingDirectory().length,
      }))
    }
  }, [])

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    void sync()

    const interval = window.setInterval(() => void sync(), DEFAULT_CONFIG.syncIntervalMs)
    const onOnline = () => void sync()
    const onOffline = () => {
      setStatus((s) => ({ ...s, ldap: 'offline', ipbx: 'offline' }))
    }
    const onAdmin = () => void sync()

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('snhc-directory-admin-changed', onAdmin)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('snhc-directory-admin-changed', onAdmin)
      abortRef.current?.abort()
    }
  }, [sync])

  const visibleEntries = useMemo(() => {
    if (includeInactive) return entries
    return entries.filter((e) => e.status !== 'inactive')
  }, [entries, includeInactive])

  const filterOptions = useMemo(() => {
    const floorsFromData = [...new Set(visibleEntries.map((e) => e.floor).filter(Boolean))]
    const floors = sortFloors([...new Set([...FLOORS, ...floorsFromData])])

    const zones = filters.floor
      ? zonesForFloor(filters.floor)
      : [...new Set([...zonesForFloor('G'), ...visibleEntries.map((e) => e.zone).filter(Boolean)])].sort()

    const scopedFromData = [
      ...new Set(
        visibleEntries
          .filter((e) => {
            if (filters.floor && e.floor !== filters.floor) return false
            if (filters.zone && e.zone !== filters.zone) return false
            return true
          })
          .map((e) => e.department)
          .filter(Boolean),
      ),
    ]
    const catalogDepts = departmentsForLocation(filters.floor, filters.zone)
    const departments =
      filters.floor || filters.zone
        ? [...new Set([...scopedFromData, ...catalogDepts])].sort()
        : [...new Set([...DEPARTMENTS, ...visibleEntries.map((e) => e.department)])].sort()

    const designations = [
      ...new Set(
        visibleEntries
          .filter((e) => {
            if (filters.floor && e.floor !== filters.floor) return false
            if (filters.zone && e.zone !== filters.zone) return false
            if (filters.department && e.department !== filters.department) return false
            return true
          })
          .map((e) => e.designation)
          .filter(Boolean),
      ),
    ].sort()

    return { floors, zones, departments, designations }
  }, [visibleEntries, filters.floor, filters.zone, filters.department])

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    const searchActive = q.length >= 3
    return visibleEntries.filter((e) => {
      if (filters.floor && e.floor !== filters.floor) return false
      if (filters.zone && e.zone !== filters.zone) return false
      if (filters.department && e.department !== filters.department) return false
      if (filters.designation && e.designation !== filters.designation) return false
      if (!searchActive) return true
      const hay = [
        e.person,
        e.designation,
        e.department,
        e.floor,
        e.zone,
        e.email,
        e.mobile,
        e.extension,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [visibleEntries, filters])

  const setFilter = useCallback(<K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) => {
    setFilters((f) => {
      const next = { ...f, [key]: value }
      if (key === 'floor') {
        next.zone = ''
        next.department = ''
        next.designation = ''
      } else if (key === 'zone') {
        next.department = ''
        next.designation = ''
      } else if (key === 'department') {
        next.designation = ''
      }
      return next
    })
  }, [])

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  return {
    ready,
    entries: filtered,
    totalCount: visibleEntries.length,
    filters,
    setFilter,
    clearFilters,
    filterOptions,
    status,
    sync,
    config: DEFAULT_CONFIG,
  }
}
