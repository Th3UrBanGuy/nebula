import { neon } from '@neondatabase/serverless';
import { Channel } from '../types';
import { CONFIG } from '../config';

// We do not initialize 'sql' at the top level to prevent errors if the URL is missing.

export const fetchChannelsFromDB = async (): Promise<Channel[] | null> => {
  // Security Check: If no DB URL is configured, fallback immediately to mocks.
  if (!CONFIG.DATABASE_URL) {
    console.warn("System Notification: No VITE_DATABASE_URL found. Running in Offline/Mock Mode.");
    return null;
  }

  try {
    console.log("System: Connecting to Nebula Stream Network (Neon DB)...");
    
    // Initialize client only when needed
    const sql = neon(CONFIG.DATABASE_URL);
    
    // Fetch channels
    const result = await sql`SELECT * FROM channels`;
    
    if (result && result.length > 0) {
      return result.map((row: any) => ({
        id: row.id,
        number: row.number,
        name: row.name,
        logo: row.logo,
        provider: row.provider,
        category: row.category,
        color: row.color,
        description: row.description
      }));
    }
    return null;
  } catch (err) {
    console.warn("Connection Error: Unable to reach stream provider. Falling back to cached data.", err);
    return null;
  }
};