// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables (Deployment/Production/Local .env)
// 2. Return empty string if missing (handled gracefully in database.ts)
const getDatabaseUrl = (): string => {
  // @ts-ignore - import.meta.env is provided by Vite
  if (import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    // @ts-ignore
    return import.meta.env.VITE_DATABASE_URL;
  }
  
  // Security: Do not hardcode secrets here. 
  // Use a .env file locally with VITE_DATABASE_URL=...
  return "";
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};