
import { LOCAL_SECRETS } from '../local_secrets';

// Tier 4: The Ultimate Fallback (Public Demo / Emergency)
// This ensures the app boots even if all other configuration methods fail.
const FALLBACK_DB_URL = "postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const ConfigManager = {
    /**
     * Retrieves the Database Connection String using a 4-Tier Robust Strategy.
     * 1. Vite/Vercel Environment Variables (Highest Priority)
     * 2. Runtime Injection (For Docker/Enterprise wrappers)
     * 3. Local Secrets File (For local dev overrides)
     * 4. Hardcoded Fallback (Failsafe)
     */
    getDatabaseUrl: (): string => {
        // Tier 1: Environment Variables (Standard Vercel/Vite Setup)
        let envVar: string | undefined = undefined;
        try {
            // Safety check: import.meta.env might be undefined in some non-Vite contexts
            // or if the build process hasn't injected it yet.
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                envVar = import.meta.env.VITE_DATABASE_URL;
            }
        } catch (e) {
            console.warn("Config: Environment variable access check failed", e);
        }

        if (isValidUrl(envVar)) {
            console.log("Config: Loaded from Environment Variables");
            return envVar;
        }

        // Tier 2: Runtime Injection (Window Object)
        // Useful for deployments where env vars are injected into index.html at runtime
        const windowConfig = (window as any).__NEBULA_CONFIG__?.DATABASE_URL;
        if (isValidUrl(windowConfig)) {
            console.log("Config: Loaded from Runtime Injection");
            return windowConfig;
        }

        // Tier 3: Local Secrets File
        // Useful for developers who want to override settings locally without touching .env
        if (isValidUrl(LOCAL_SECRETS.DATABASE_URL)) {
            console.log("Config: Loaded from Local Secrets");
            return LOCAL_SECRETS.DATABASE_URL!;
        }

        // Tier 4: Fallback
        console.warn("Config: Using Fallback Database URL");
        return FALLBACK_DB_URL;
    },

    /**
     * Helper to get other non-sensitive settings
     */
    getAppMode: (): string => {
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE) {
                return import.meta.env.MODE;
            }
            return 'production';
        } catch {
            return 'production';
        }
    }
};

// Helper to validate basic Postgres URL structure
const isValidUrl = (url: string | undefined | null): url is string => {
    return typeof url === 'string' && url.trim().length > 0 && url.startsWith('postgres');
};
