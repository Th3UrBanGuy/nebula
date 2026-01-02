/**
 * Type definitions for Vite environment variables.
 * Reference to vite/client is removed to avoid resolution errors if the package is missing or misconfigured.
 */

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
