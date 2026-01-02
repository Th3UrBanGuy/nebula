
/**
 * TIER 3: Local Secrets Configuration
 * 
 * This file is intended for local development overrides.
 * It is checked if Environment Variables (Tier 1) and Runtime Injection (Tier 2) are missing.
 * 
 * You can paste your production DB string here for local testing if .env is acting up.
 */

export const LOCAL_SECRETS = {
    // Optional: Paste your connection string here to override locally
    DATABASE_URL: null as string | null, 
    
    // Add other local overrides here
    DEBUG_MODE: false
};
