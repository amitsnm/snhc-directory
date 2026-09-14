import type { AppConfig, DirectoryEntry } from '../types/directory'
import { formatFloorLabel } from '../data/locations'

export type DialResult =
  | { ok: true; message: string }
  | { ok: false; message: string }

/**
 * Originate a call via IPBX (Asterisk ARI / FreePBX / 3CX-style gateway).
 * Uses tel: fallback when the IPBX API is offline so extension dial still works
 * on softphones and desk phones that register the protocol handler.
 */
export async function dialExtension(
  entry: DirectoryEntry,
  config: AppConfig,
  callerExtension?: string,
): Promise<DialResult> {
  const ext = entry.extension?.trim()
  if (!ext) {
    return { ok: false, message: 'No extension on this contact' }
  }

  if (navigator.onLine && config.ipbxUrl) {
    try {
      const response = await fetch(config.ipbxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.ipbxApiKey ? { Authorization: `Bearer ${config.ipbxApiKey}` } : {}),
        },
        body: JSON.stringify({
          endpoint: ext,
          callerId: callerExtension ?? 'directory',
          name: entry.person,
          timeout: 30,
        }),
      })

      if (response.ok) {
        return { ok: true, message: `Dialing ${entry.person} · Ext ${ext}` }
      }

      // Non-OK: fall through to tel: URI
    } catch {
      // Network / CORS: fall through
    }
  }

  // Softphone / native dialer fallback — works offline for registered handlers
  try {
    window.location.href = `tel:${ext}`
    return {
      ok: true,
      message: navigator.onLine
        ? `Opening dialer for Ext ${ext}`
        : `Offline dial · Ext ${ext}`,
    }
  } catch {
    return { ok: false, message: `Could not dial Ext ${ext}` }
  }
}

export async function copyText(label: string, value: string): Promise<DialResult> {
  if (!value?.trim()) {
    return { ok: false, message: `No ${label} to copy` }
  }
  try {
    await navigator.clipboard.writeText(value.trim())
    return { ok: true, message: `${label} copied` }
  } catch {
    return { ok: false, message: `Could not copy ${label}` }
  }
}

export function formatContactCard(entry: DirectoryEntry): string {
  return [
    entry.person,
    entry.designation,
    entry.department,
    `Floor: ${formatFloorLabel(entry.floor)} · Zone: ${entry.zone}`,
    entry.email ? `Email: ${entry.email}` : null,
    entry.mobile ? `Mobile: ${entry.mobile}` : null,
    entry.extension ? `Ext: ${entry.extension}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}
