// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables (Deployment/Production/Local .env)
// 2. Robust cleaning of the string (removing quotes, whitespace)
// 3. Remove 'channel_binding' parameter which causes 'Invalid name' fetch errors in browsers
// 4. Fallback for immediate functionality if env var is missing
const getDatabaseUrl = (): string => {
  let url = "";

  try {
      // @ts-ignore - import.meta.env is provided by Vite
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATABASE_URL) {
        // @ts-ignore
        url = String(import.meta.env.VITE_DATABASE_URL);
      }
  } catch (e) {
      console.warn("Config: Error accessing import.meta.env");
  }

  // Fallback if empty or "undefined"
  if (!url || url === "undefined" || url === "null" || url.trim() === "") {
      // Default fallback (Development/Demo)
      // Note: channel_binding=require is REMOVED intentionally for browser compatibility
      url = "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  }

  // CLEANUP LOGIC
  
  // 1. Trim whitespace
  url = url.trim();

  // 2. Remove surrounding quotes (common copy-paste error from Vercel/env files)
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
      url = url.substring(1, url.length - 1);
  }

  // 3. Remove 'channel_binding=require' parameter.
  //    This parameter causes "Failed to execute 'fetch' on 'Window': Invalid name" error
  //    in the @neondatabase/serverless driver when running in a browser environment.
  if (url.includes("channel_binding=require")) {
      url = url.replace("channel_binding=require", "");
      // Clean up potential resulting malformed query strings
      url = url.replace("?&", "?").replace("&&", "&");
      if (url.endsWith("&") || url.endsWith("?")) {
          url = url.slice(0, -1);
      }
  }
  
  return url;
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};