# Nebula Live OS

## Security & Database Setup

This project uses **Neon (PostgreSQL)** for the live database.

### 1. Local Development (Secure)
To keep your database credentials secure, **DO NOT** hardcode them in the files.
1. Create a file named `.env` in the root directory.
2. Add your connection string:
   ```
   VITE_DATABASE_URL=postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
3. The `.env` file is ignored by Git, ensuring your secrets are safe.

### 2. Deployment (Vercel/Netlify)
1. Go to your project settings in the deployment dashboard.
2. Navigate to **Environment Variables**.
3. Add a new variable:
   - Key: `VITE_DATABASE_URL`
   - Value: `postgresql://neondb_owner:npg_ZMlPjxOk63VF@ep-cool-water-adt0eidc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

## Architecture
- **Frontend**: React 19, Vite, Tailwind CSS
- **State**: Zustand
- **Database**: Neon Serverless (Direct secure connection)