import type { DirectoryEntry } from '../types/directory'
import { SEED_DIRECTORY } from '../data/seed'

const DB_NAME = 'intercom-directory'
const DB_VERSION = 2
const STORE = 'entries'
const META = 'meta'
/** Bump when seed / location schema changes so offline cache refreshes. */
const DATA_SCHEMA = 'snhc-apps-script-directory-05-sep-2026-v1'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META, { keyPath: 'key' })
      }
    }
  })
}

async function getMeta(key: string): Promise<string | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(META, 'readonly')
      const req = tx.objectStore(META).get(key)
      req.onsuccess = () => {
        db.close()
        resolve((req.result?.value as string) ?? null)
      }
      req.onerror = () => {
        db.close()
        reject(req.error)
      }
    })
  } catch {
    return null
  }
}

export async function loadCachedEntries(): Promise<DirectoryEntry[]> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAll()
      req.onsuccess = () => {
        db.close()
        const rows = (req.result as DirectoryEntry[]) ?? []
        resolve(rows.length > 0 ? rows : SEED_DIRECTORY)
      }
      req.onerror = () => {
        db.close()
        reject(req.error)
      }
    })
  } catch {
    return SEED_DIRECTORY
  }
}

export async function saveCachedEntries(entries: DirectoryEntry[]): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE, META], 'readwrite')
    const store = tx.objectStore(STORE)
    store.clear()
    for (const entry of entries) {
      store.put(entry)
    }
    const meta = tx.objectStore(META)
    meta.put({ key: 'lastSyncedAt', value: new Date().toISOString() })
    meta.put({ key: 'dataSchema', value: DATA_SCHEMA })
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

export async function getLastSyncedAt(): Promise<string | null> {
  return getMeta('lastSyncedAt')
}

/** Ensure seed is written once so offline open always has data. */
export async function ensureSeedCache(): Promise<DirectoryEntry[]> {
  try {
    const schema = await getMeta('dataSchema')
    const db = await openDb()
    const rows = await new Promise<DirectoryEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAll()
      req.onsuccess = () => {
        db.close()
        resolve((req.result as DirectoryEntry[]) ?? [])
      }
      req.onerror = () => {
        db.close()
        reject(req.error)
      }
    })

    if (rows.length === 0 || schema !== DATA_SCHEMA) {
      await saveCachedEntries(SEED_DIRECTORY)
      return SEED_DIRECTORY
    }
    return rows
  } catch {
    return SEED_DIRECTORY
  }
}
