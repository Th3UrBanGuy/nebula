// Config Interface
interface Config {
  DATABASE_URL: string;
}

// Logic:
// 1. Check for Vite environment variables (Deployment/Production/Local .env)
// 2. Return the provided connection string as fallback for immediate functionality
const getDatabaseUrl = (): string => {
  let url = "";

  // @ts-ignore - import.meta.env is provided by Vite
  if (import.meta.env && import.meta.env.VITE_DATABASE_URL) {
    // @ts-ignore
    url = import.meta.env.VITE_DATABASE_URL;
  }
  
  // DIRECT OVERRIDE: Using the provided connection string to ensure immediate functionality.
  // In a real production environment, keep this in a .env file.
  if (!url || url.trim() === "") {
      url = "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  }
  
  return url.trim();
};

export const CONFIG: Config = {
  DATABASE_URL: getDatabaseUrl(),
};