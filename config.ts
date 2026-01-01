import { LOCAL_DB_URL } from './local_secrets';

// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables (Deployment/Production)
// 2. Fallback to local_secrets.ts (Local Development)
// Note: VITE_DATABASE_URL must be set in your deployment platform (Vercel/Netlify/etc.)
const getDatabaseUrl = (): string => {
  // @ts-ignore - import.meta.env is provided by Vite
  if (import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    // @ts-ignore
    return import.meta.env.VITE_DATABASE_URL;
  }
  return LOCAL_DB_URL;
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};