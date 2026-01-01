// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables
// 2. Use the URL Class to parse and aggressively sanitize the connection string
// 3. Remove params that cause browser 'fetch' header errors (channel_binding, sslmode)
const getDatabaseUrl = (): string => {
  let urlStr = "";

  try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DATABASE_URL) {
        // @ts-ignore
        urlStr = String(import.meta.env.VITE_DATABASE_URL);
      }
  } catch (e) {
      console.warn("Config: Error accessing import.meta.env");
  }

  // Fallback if empty, undefined, or null
  if (!urlStr || urlStr === "undefined" || urlStr === "null" || urlStr.trim() === "") {
      // Default fallback (Clean URL without parameters)
      urlStr = "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb";
  }

  // --- ROBUST SANITIZATION ---
  try {
      // 1. Remove surrounding quotes if present
      urlStr = urlStr.trim();
      if ((urlStr.startsWith('"') && urlStr.endsWith('"')) || (urlStr.startsWith("'") && urlStr.endsWith("'"))) {
          urlStr = urlStr.substring(1, urlStr.length - 1);
      }

      // 2. Parse using URL object to safely handle parameters
      // Note: We force the protocol to be recognized if it's missing (though unlikely for a DB string)
      if (!urlStr.includes("://")) {
          urlStr = "postgresql://" + urlStr;
      }

      const urlObj = new URL(urlStr);

      // 3. REMOVE problematic parameters
      // The neon driver sets these as HTTP Headers. Browsers reject invalid headers like 'channel_binding'.
      urlObj.searchParams.delete('channel_binding'); 
      urlObj.searchParams.delete('sslmode');
      urlObj.searchParams.delete('options');
      urlObj.searchParams.delete('connect_timeout');

      // 4. Return clean string
      return urlObj.toString();

  } catch (e) {
      console.error("Config: Fatal Error parsing Database URL", e);
      // Return the string stripped of common issues as a last resort, or empty if totally invalid
      return urlStr.split('?')[0]; 
  }
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};