// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables (Deployment/Production/Local .env)
// 2. Robust cleaning of the string (removing quotes, whitespace)
// 3. Fallback for immediate functionality if env var is missing
const getDatabaseUrl = (): string => {
  let url = "";

  // @ts-ignore - import.meta.env is provided by Vite
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    // @ts-ignore
    url = String(import.meta.env.VITE_DATABASE_URL);
  }
  
  // Clean the URL: Remove surrounding quotes if they exist (common Vercel issue) and trim whitespace
  if (url) {
      url = url.trim();
      if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
          url = url.substring(1, url.length - 1);
      }
      if (url === "undefined" || url === "null") {
          url = "";
      }
  }

  // DIRECT OVERRIDE: Using the provided connection string to ensure immediate functionality.
  if (!url) {
      // NOTE: If this specific DB is suspended/deleted, you MUST provide your own VITE_DATABASE_URL in .env
      url = "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  }
  
  return url;
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};