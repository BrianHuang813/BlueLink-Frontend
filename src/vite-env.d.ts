/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SUI_NETWORK: 'testnet' | 'mainnet' | 'devnet'
  readonly VITE_SUI_RPC_URL: string
  readonly VITE_SUI_PACKAGE_ID: string
  readonly VITE_SUI_CLOCK_OBJECT_ID: string
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
