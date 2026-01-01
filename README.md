# Nebula Live OS

## Security & Database Setup

This project uses **Neon (PostgreSQL)** for the live database.

### 1. Local Development (Secure)
To keep your database credentials secure, **DO NOT** hardcode them in the files.
1. Create a file named `.env` in the root directory.
2. Add your connection string (Note: `channel_binding` is removed for browser compatibility):
   ```
   VITE_DATABASE_URL=postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. The `.env` file is ignored by Git, ensuring your secrets are safe.

### 2. Deployment (Vercel/Netlify)
1. Go to your project settings in the deployment dashboard.
2. Navigate to **Environment Variables**.
3. Add a new variable:
   - Key: `VITE_DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`

**Troubleshooting:**
If you see "Database Not Connected" or "Invalid name" errors, ensure your connection string does **NOT** contain `channel_binding=require` and does not have surrounding quotes (e.g., `"postgresql://..."`).

## Architecture
- **Frontend**: React 19, Vite, Tailwind CSS
- **State**: Zustand
- **Database**: Neon Serverless (Direct secure connection)