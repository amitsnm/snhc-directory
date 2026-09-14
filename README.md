# Intercom Directory

Single-page campus intercom directory with live LDAP sync, IPBX click-to-dial, contact copy, and offline-first cache.

## Features

- **Search** across person, designation, department, floor, zone, email, mobile, extension
- **Filters** for Floor, Zone, Department, Designation
- **Dial** extension via IPBX API (`tel:` fallback when offline)
- **Copy** email, mobile, extension, or full contact card
- **LDAP** sync through a gateway URL (see env)
- **Offline**: IndexedDB cache + PWA service worker — directory opens without internet from last sync (seed data on first run)

## Quick start

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and set your LDAP gateway and IPBX endpoints.

## LDAP gateway contract

`GET {VITE_LDAP_URL}?baseDn=...&scope=subtree`

Expected JSON array (or `{ "entries": [...] }`) with fields such as:

`displayName` / `cn`, `title`, `department`, `floor` / `physicalDeliveryOfficeName`, `zone`, `mail`, `mobile`, `telephoneNumber`, `extensionAttribute1`, `dn`, `whenChanged`

## IPBX dial contract

`POST {VITE_IPBX_URL}`

```json
{
  "endpoint": "1012",
  "callerId": "directory",
  "name": "Rohit Sharma",
  "timeout": 30
}
```

Authorize with `Authorization: Bearer {VITE_IPBX_API_KEY}` when required.

## Offline behaviour

1. App boots from IndexedDB (or built-in seed if empty).
2. When online, LDAP sync refreshes the cache on an interval.
3. When offline or LDAP fails, UI keeps serving the last good cache.
4. Service worker keeps the shell available without network.

## Seed data

Directory seed is from **SNHC Directory 20260825.pdf** (`src/data/snhc-directory.json`, as on 25-Aug-2026).
Re-parse with:

```bash
python scripts/parse_snhc_pdf.py
```
