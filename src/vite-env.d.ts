/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_LDAP_URL?: string
  readonly VITE_LDAP_BASE_DN?: string
  readonly VITE_IPBX_URL?: string
  readonly VITE_IPBX_API_KEY?: string
  readonly VITE_SYNC_INTERVAL_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
