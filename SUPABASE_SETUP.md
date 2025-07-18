# 🚀 Supabase Setup Guide for DIY Recipe Project

## ✅ What's Already Done:
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ All API routes converted to use Supabase
- ✅ Authentication helpers created (`src/lib/auth.ts`)
- ✅ Database schema ready (`supabase-schema.sql`)
- ✅ Environment variables template created

## 🔧 What You Need to Do:

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up/login and create a new project
3. Choose a project name (e.g., "diy-recipe-app")
4. Choose a region close to you
5. Set a strong database password
6. Wait for project to be created (~2 minutes)

### 2. Get Your Project Credentials
After project creation, go to:
1. **Settings** → **API** 
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Update Environment Variables
Edit your `.env.local` file and replace:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

With your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Database Schema
1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** to execute the schema

### 5. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`

### 6. Test the Setup
```bash
npm run dev
```

Your app should now be running with Supabase! 🎉

## 🔥 New Features You Now Have:

### 🔐 **Authentication**
- User registration/login
- Password reset
- Session management
- Row Level Security (users only see their own data)

### 🏗️ **Cloud Database**
- PostgreSQL (much more powerful than SQLite)
- Real-time subscriptions
- Automatic backups
- Scalable

### 🚀 **Production Ready**
- Multi-user support
- Cloud hosted
- Secure by default

## 📝 Next Steps After Setup:
1. Update login/signup pages to use the new auth system
2. Add "Save Recipe" buttons in RecipeModal
3. Create "My Recipes" page
4. Add user profile management

## 🆘 Need Help?
- Supabase docs: https://supabase.com/docs
- If you get stuck, just ask me! 🤖

---
**Note**: Keep your Supabase credentials secure and never commit them to git!
