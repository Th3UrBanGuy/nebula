
// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// The Neon Serverless HTTP driver for browsers is very sensitive to query parameters.
// Parameters like 'channel_binding', 'sslmode', 'options' often cause "Invalid name" fetch errors.
//
// SIMPLIFIED STRATEGY:
// We strictly strip ALL query parameters. The HTTP driver works perfectly with just
// the base URL (postgres://user:pass@host/db). This removes all restrictions and potential errors.

const getDatabaseUrl = (): string => {
  try {
      // 1. Get URL from Environment or use default fallback
      let url = "";

      // Safe access: Check if import.meta.env exists before accessing properties
      // This prevents "Cannot read properties of undefined (reading 'VITE_DATABASE_URL')"
      if (typeof import.meta !== 'undefined' && import.meta.env) {
          url = import.meta.env.VITE_DATABASE_URL;
      }

      // Fallback if env var is missing (Development/Demo)
      if (!url || typeof url !== 'string' || url === "undefined") {
          return "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
      }

      // 2. Clean whitespace and quotes (common Vercel/Env copy-paste artifacts)
      url = url.trim().replace(/["']/g, "");

      // 3. NUCLEAR CLEANING: Remove everything after '?'
      // This ensures 'channel_binding', 'sslmode', and any other browser-breaking params are gone.
      const queryIndex = url.indexOf('?');
      if (queryIndex !== -1) {
          url = url.substring(0, queryIndex);
      }

      // 4. Ensure Protocol
      if (!url.includes("://")) {
          url = "postgresql://" + url;
      }

      return url;

  } catch (e) {
      console.error("Config: Fatal Error processing URL", e);
      return "";
  }
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};
