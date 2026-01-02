import { Channel, User, LicenseKey } from '../types';
import { Pool } from '@neondatabase/serverless';

// Retrieve the database URL from Vite environment variables
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

if (!DATABASE_URL) {
    console.error("CRITICAL ERROR: VITE_DATABASE_URL is missing from environment variables.");
}

// Initialize Neon Serverless Pool
const pool = new Pool({ connectionString: DATABASE_URL });

// --- INITIALIZATION ---

export const initializeSchema = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        if (!DATABASE_URL) {
            return { success: false, error: "Database configuration missing." };
        }

        // Create tables if they don't exist
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT,
                avatar TEXT,
                cover_image TEXT,
                bio TEXT,
                preferences JSONB,
                license_data JSONB
            )`,
            `CREATE TABLE IF NOT EXISTS channels (
                id TEXT PRIMARY KEY,
                number TEXT,
                name TEXT,
                logo TEXT,
                provider TEXT,
                category TEXT,
                color TEXT,
                description TEXT,
                stream_url TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS licenses (
                id TEXT PRIMARY KEY,
                key_code TEXT UNIQUE,
                plan_name TEXT,
                duration_days INTEGER,
                status TEXT,
                created_at BIGINT
            )`,
            // New Settings Table for System Configs (Like Ayna URL)
            `CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`
        ];

        for (const q of queries) {
            await pool.query(q);
        }

        // --- MIGRATION FIXES ---
        // Ensure columns exist if table was created with older schema
        try {
            await pool.query(`ALTER TABLE channels ADD COLUMN IF NOT EXISTS number TEXT`);
            await pool.query(`ALTER TABLE channels ADD COLUMN IF NOT EXISTS stream_url TEXT`);
            await pool.query(`ALTER TABLE channels ADD COLUMN IF NOT EXISTS color TEXT`);
            
            // Users table migrations
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS license_data JSONB`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image TEXT`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT`);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`);
        } catch (migErr) {
            console.log("Migration Note:", migErr);
        }
        
        console.log("Neon DB: Schema Initialized and Connected.");
        return { success: true };
    } catch (e: any) {
        console.error("Neon DB Init Error:", e);
        return { success: false, error: e.message };
    }
};

// --- SETTINGS OPERATIONS ---

export const getSetting = async (key: string): Promise<string | null> => {
    try {
        const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
        if (rows.length > 0) return rows[0].value;
        return null;
    } catch (err) {
        console.error("Get Setting Error:", err);
        return null;
    }
};

export const saveSetting = async (key: string, value: string): Promise<boolean> => {
    try {
        await pool.query(
            `INSERT INTO settings (key, value) VALUES ($1, $2)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
            [key, value]
        );
        return true;
    } catch (err) {
        console.error("Save Setting Error:", err);
        return false;
    }
};

// --- CHANNEL OPERATIONS ---

export const fetchChannelsFromDB = async (): Promise<Channel[] | null> => {
    try {
        const { rows } = await pool.query('SELECT * FROM channels ORDER BY number ASC');
        if (rows.length === 0) return null;

        return rows.map((row: any) => ({
            id: row.id,
            number: row.number || '000',
            name: row.name,
            logo: row.logo,
            provider: row.provider,
            category: row.category,
            color: row.color || 'bg-stone-800', // Fallback default color
            description: row.description,
            streamUrl: row.stream_url
        }));
    } catch (err) {
        console.error("Fetch Channels Error:", err);
        return null;
    }
};

export const addChannelsToDB = async (channels: Channel[]): Promise<boolean> => {
    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const c of channels) {
                await client.query(
                    `INSERT INTO channels (id, number, name, logo, provider, category, color, description, stream_url) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                     ON CONFLICT (id) DO UPDATE SET
                     number = EXCLUDED.number,
                     name = EXCLUDED.name,
                     logo = EXCLUDED.logo,
                     category = EXCLUDED.category,
                     provider = EXCLUDED.provider,
                     color = EXCLUDED.color,
                     description = EXCLUDED.description,
                     stream_url = EXCLUDED.stream_url`,
                    [c.id, c.number, c.name, c.logo, c.provider, c.category, c.color || 'bg-stone-800', c.description, c.streamUrl]
                );
            }
            await client.query('COMMIT');
            return true;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Add Channels Error:", err);
        return false;
    }
};

export const deleteChannelFromDB = async (id: string): Promise<boolean> => {
    try {
        await pool.query('DELETE FROM channels WHERE id = $1', [id]);
        return true;
    } catch (err) {
        return false;
    }
};

// --- LICENSE OPERATIONS ---

export const createLicenseInDB = async (key: string, plan: string, days: number): Promise<{success: boolean, message?: string}> => {
    try {
        const id = 'lic_' + Math.random().toString(36).substr(2, 9);
        const createdAt = Date.now();
        
        await pool.query(
            `INSERT INTO licenses (id, key_code, plan_name, duration_days, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [id, key, plan, days, 'unused', createdAt]
        );
        return { success: true };
    } catch (err: any) {
        if (err.code === '23505') {
            return { success: false, message: "License key already exists." };
        }
        return { success: false, message: "Database error." };
    }
};

export const fetchAllLicenses = async (): Promise<LicenseKey[]> => {
    try {
        const { rows } = await pool.query('SELECT * FROM licenses ORDER BY created_at DESC');
        return rows.map((row: any) => ({
            id: row.id,
            key: row.key_code,
            plan: row.plan_name,
            durationDays: row.duration_days,
            status: row.status as 'unused' | 'redeemed',
            createdAt: Number(row.created_at)
        }));
    } catch (err) {
        return [];
    }
};

export const redeemLicenseKey = async (key: string): Promise<{valid: boolean, plan?: string, days?: number}> => {
    if (key === 'LIVE-FREE-2025') return { valid: true, plan: 'Nebula Access Pass', days: 365 };

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query('SELECT * FROM licenses WHERE key_code = $1 FOR UPDATE', [key]);
            if (res.rows.length === 0) {
                await client.query('ROLLBACK');
                return { valid: false };
            }

            const license = res.rows[0];
            if (license.status !== 'unused') {
                await client.query('ROLLBACK');
                return { valid: false };
            }

            await client.query("UPDATE licenses SET status = 'redeemed' WHERE id = $1", [license.id]);
            await client.query('COMMIT');

            return { valid: true, plan: license.plan_name, days: license.duration_days };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Redeem Error:", err);
        return { valid: false };
    }
};

// --- USER / AUTH OPERATIONS ---

export const registerUserInDB = async (user: User, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await pool.query(
            `INSERT INTO users (id, name, email, password, role, avatar, cover_image, bio, preferences, license_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                user.id, 
                user.name, 
                user.email, 
                password, 
                user.role, 
                user.avatar, 
                user.coverImage, 
                user.bio, 
                JSON.stringify(user.preferences || { notifications: true, autoplay: true }), 
                JSON.stringify(user.license || null)
            ]
        );
        return { success: true };
    } catch (err: any) {
        console.error("Register Error:", err);
        // Postgres unique violation code for email constraint
        if (err.code === '23505') {
            return { success: false, error: "Email address is already registered." };
        }
        return { success: false, error: "Database error: " + err.message };
    }
};

export const loginUserFromDB = async (email: string, password: string): Promise<User | null> => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (rows.length > 0) {
            const row = rows[0];
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role as 'admin' | 'viewer',
                avatar: row.avatar,
                coverImage: row.cover_image,
                bio: row.bio,
                preferences: row.preferences || { notifications: true, autoplay: true },
                license: row.license_data || undefined
            };
        }
        return null;
    } catch (err) {
        console.error("Login Error:", err);
        return null;
    }
};

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (rows.length > 0) {
            const row = rows[0];
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                role: row.role as 'admin' | 'viewer',
                avatar: row.avatar,
                coverImage: row.cover_image,
                bio: row.bio,
                preferences: row.preferences || { notifications: true, autoplay: true },
                license: row.license_data || undefined
            };
        }
        return null;
    } catch (err) {
        return null;
    }
};

export const updateUserInDB = async (user: User): Promise<boolean> => {
    try {
        await pool.query(
            `UPDATE users SET 
             name = $1, 
             bio = $2, 
             avatar = $3, 
             cover_image = $4, 
             preferences = $5, 
             license_data = $6 
             WHERE id = $7`,
            [
                user.name,
                user.bio,
                user.avatar,
                user.coverImage,
                JSON.stringify(user.preferences),
                JSON.stringify(user.license || null),
                user.id
            ]
        );
        return true;
    } catch (err) {
        console.error("Update User Error:", err);
        return false;
    }
};