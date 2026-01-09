// Manual type definitions for Vite environment variables to resolve missing 'vite/client' reference issues.
// These definitions ensure that 'import.meta.env' is correctly typed throughout the application.

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  readonly BASE_URL: string;
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
