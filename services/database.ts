
import { neon } from '@neondatabase/serverless';
import { Channel, User } from '../types';
import { CONFIG } from '../config';

// Helper to get DB client
const getSql = () => {
  if (!CONFIG.DATABASE_URL) return null;
  return neon(CONFIG.DATABASE_URL);
};

// --- INITIALIZATION ---

export const initializeSchema = async (): Promise<boolean> => {
    const sql = getSql();
    if (!sql) {
        console.warn("DB: No connection string found. Skipping schema initialization.");
        return false;
    }

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'viewer',
                avatar TEXT,
                cover_image TEXT,
                bio TEXT,
                preferences JSONB,
                license_data JSONB
            )
        `;

        // Migration: Ensure license_data column exists for older tables
        try {
            await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_data JSONB`;
        } catch (e) {
            // Ignore if column exists or not supported in this dialect (Neon usually supports it)
        }
        
        await sql`
            CREATE TABLE IF NOT EXISTS channels (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                logo TEXT,
                category TEXT,
                provider TEXT,
                stream_url TEXT,
                description TEXT
            )
        `;
        
        console.log("DB: Schema verified and ready.");
        return true;
    } catch (err) {
        console.error("DB Init Error:", err);
        return false;
    }
};

// --- CHANNEL OPERATIONS ---

export const fetchChannelsFromDB = async (): Promise<Channel[] | null> => {
  const sql = getSql();
  if (!sql) return null;

  try {
    const result = await sql`SELECT * FROM channels`;
    return result.map((row: any) => ({
      id: row.id,
      number: row.id.substring(0, 4), // Generate pseudo number from ID
      name: row.name,
      logo: row.logo,
      provider: row.provider,
      category: row.category,
      color: 'bg-stone-800', // Default color, or store in DB if needed
      description: row.description,
      streamUrl: row.stream_url
    }));
  } catch (err) {
    console.error("DB Fetch Error:", err);
    return null;
  }
};

export const addChannelsToDB = async (channels: Channel[]): Promise<boolean> => {
  const sql = getSql();
  if (!sql) return false;

  try {
    for (const ch of channels) {
      await sql`
        INSERT INTO channels (id, name, logo, category, provider, stream_url, description)
        VALUES (${ch.id}, ${ch.name}, ${ch.logo}, ${ch.category}, ${ch.provider}, ${ch.streamUrl}, ${ch.description})
        ON CONFLICT (id) DO NOTHING
      `;
    }
    return true;
  } catch (err) {
    console.error("DB Import Error:", err);
    return false;
  }
};

export const deleteChannelFromDB = async (id: string): Promise<boolean> => {
    const sql = getSql();
    if (!sql) return false;
    try {
        await sql`DELETE FROM channels WHERE id = ${id}`;
        return true;
    } catch (err) {
        console.error("DB Delete Error:", err);
        return false;
    }
}

// --- USER / AUTH OPERATIONS ---

export const registerUserInDB = async (user: User, password: string): Promise<boolean> => {
  const sql = getSql();
  if (!sql) return false;

  try {
    // Pass objects directly; Neon driver handles JSON serialization for JSONB columns.
    await sql`
      INSERT INTO users (id, name, email, password, role, avatar, cover_image, bio, preferences, license_data)
      VALUES (${user.id}, ${user.name}, ${user.email}, ${password}, ${user.role}, ${user.avatar}, ${user.coverImage || null}, ${user.bio}, ${user.preferences}, ${user.license || null})
    `;
    return true;
  } catch (err) {
    console.error("Registration Error:", err);
    return false;
  }
};

export const loginUserFromDB = async (email: string, password: string): Promise<User | null> => {
  const sql = getSql();
  if (!sql) return null;

  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
    
    if (result.length > 0) {
      const row = result[0];
      return mapUserRow(row);
    }
    return null;
  } catch (err) {
    console.error("Login Error:", err);
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
    const sql = getSql();
    if (!sql) return null;

    try {
        const result = await sql`SELECT * FROM users WHERE id = ${id}`;
        if (result.length > 0) {
            return mapUserRow(result[0]);
        }
        return null;
    } catch (err) {
        return null;
    }
}

export const updateUserInDB = async (user: User): Promise<boolean> => {
    const sql = getSql();
    if (!sql) return false;
    try {
        await sql`
            UPDATE users 
            SET name = ${user.name}, bio = ${user.bio}, avatar = ${user.avatar}, cover_image = ${user.coverImage}, license_data = ${user.license || null}
            WHERE id = ${user.id}
        `;
        return true;
    } catch (err) {
        console.error("Update User Error", err);
        return false;
    }
}

// Helper to map DB row to User object
const mapUserRow = (row: any): User => {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role as 'admin' | 'viewer',
        avatar: row.avatar,
        coverImage: row.cover_image,
        bio: row.bio,
        preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences) : (row.preferences || { notifications: true, autoplay: true }),
        license: typeof row.license_data === 'string' ? JSON.parse(row.license_data) : row.license_data
    };
};
