import { neon } from '@neondatabase/serverless';
import { Channel } from '../types';
import { CONFIG } from '../config';

// Initialize the Neon SQL client using the URL from our config
// This allows switching between Local Dev (local_secrets.ts) and Prod (Env Vars) automatically.
export const sql = neon(CONFIG.DATABASE_URL);

export const fetchChannelsFromDB = async (): Promise<Channel[] | null> => {
  try {
    console.log("Attempting to connect to Neon DB...");
    // Assuming a table 'channels' exists. If not, this will throw, and we catch it to fallback to mocks.
    // We map the DB result to our Channel interface type
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
    console.warn("DB Connection/Query failed. This is expected if the table doesn't exist or if accessing directly from browser without CORS proxy. Falling back to internal mock data.", err);
    return null;
  }
};