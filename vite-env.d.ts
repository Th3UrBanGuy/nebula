interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
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
