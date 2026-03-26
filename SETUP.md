# Study Hub — Environment Setup

Copy this file to `.env` (already in .gitignore) and fill in your Supabase credentials.

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key-here
```

## How to Get Your Keys

1. Go to [supabase.com](https://supabase.com) → Create a free project
2. Navigate to **Project Settings → API**
3. Copy:
   - **Project URL** → paste as `VITE_SUPABASE_URL`
   - **anon public** key → paste as `VITE_SUPABASE_ANON_KEY`

## Run the Database Migration

1. In your Supabase dashboard, open the **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_schema.sql`
4. Paste and click **Run**

## Disable Email Confirmation (Optional, for quick dev testing)

By default Supabase sends a confirmation email on signup. To skip this during local development:

1. Supabase Dashboard → **Authentication → Settings**
2. Turn off **Enable email confirmations**

## Start the App

```
npm run dev
```

Navigate to `http://localhost:5173` — you'll see the Login page.
