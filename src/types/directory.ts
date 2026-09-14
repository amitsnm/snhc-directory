export type ConnectionState = 'online' | 'offline' | 'syncing' | 'error'

export type ViewMode = 'list' | 'grid' | 'floor' | 'department'

export interface DirectoryEntry {
  id: string
  person: string
  designation: string
  department: string
  floor: string
  zone: string
  email: string
  mobile: string
  extension: string
  ldapDn?: string
  updatedAt: string
}

export interface DirectoryFilters {
  query: string
  floor: string
  zone: string
  department: string
  designation: string
}

export interface SyncStatus {
  ldap: ConnectionState
  ipbx: ConnectionState
  lastSyncedAt: string | null
  source: 'live' | 'cache'
  entryCount: number
}

export interface AppConfig {
  ldapUrl: string
  ldapBaseDn: string
  ipbxUrl: string
  ipbxApiKey: string
  syncIntervalMs: number
}
