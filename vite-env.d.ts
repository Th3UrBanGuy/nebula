/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Support for Tier 2: Runtime Injection via Window object
interface Window {
    __NEBULA_CONFIG__?: {
        DATABASE_URL?: string;
    }
}
