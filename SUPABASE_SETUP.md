# Supabase Setup Guide for GrantWise AI

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Project

1. **Go to Supabase:**
   - Visit https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Name: `grantwise-ai`
   - Database Password: (generate strong password)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

### Step 2: Get API Credentials

1. **In Supabase Dashboard:**
   - Go to Settings → API
   - Copy these values:

   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Add to `.env` file:**
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   APP_URL=http://localhost:3000
   ```

### Step 3: Create Database Tables

1. **Go to SQL Editor** in Supabase Dashboard

2. **Run this SQL:**

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  organization_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'team')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  proposals_this_month INTEGER DEFAULT 0,
  proposals_total INTEGER DEFAULT 0,
  last_reset_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  organization_name TEXT,
  proposal_text TEXT NOT NULL,
  project_data JSONB,
  parsed_guidelines JSONB,
  compliance_report JSONB,
  metadata JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'submitted', 'won', 'lost')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create saved_grants table
CREATE TABLE saved_grants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grant_id TEXT NOT NULL,
  grant_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for proposals table
CREATE POLICY "Users can view own proposals"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own proposals"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own proposals"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for saved_grants table
CREATE POLICY "Users can view own saved grants"
  ON saved_grants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved grants"
  ON saved_grants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved grants"
  ON saved_grants FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_saved_grants_user_id ON saved_grants(user_id);
```

3. **Click "Run"** - Tables will be created!

### Step 4: Enable Google OAuth (Optional)

1. **In Supabase Dashboard:**
   - Go to Authentication → Providers
   - Enable "Google"

2. **Get Google OAuth Credentials:**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     ```

3. **Add to Supabase:**
   - Paste Client ID and Client Secret
   - Save

### Step 5: Configure Email Templates (Optional)

1. **Go to Authentication → Email Templates**
2. **Customize:**
   - Confirmation email
   - Password reset email
   - Magic link email

---

## 🔧 Environment Variables

Add these to your `.env` file:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=http://localhost:3000

# For production (Render)
APP_URL=https://grantwise-ai.onrender.com
```

---

## ✅ Verify Setup

1. **Test Connection:**
   ```bash
   npm run dev
   ```

2. **Go to:**
   - http://localhost:3000/signup
   - Create test account
   - Check Supabase Dashboard → Authentication → Users

3. **Should see:**
   - ✅ User in auth.users
   - ✅ Profile in users table
   - ✅ Email verification sent

---

## 🎯 What You Get

### ✅ **Built-in Features:**
- Email/password authentication
- Email verification
- Password reset
- Google OAuth (if configured)
- Session management
- Row-level security
- Real-time subscriptions

### ✅ **Free Tier Includes:**
- 50,000 monthly active users
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests

---

## 📊 Database Schema

### **users** table:
- `id` - User ID (from auth.users)
- `email` - Email address
- `first_name` - First name
- `last_name` - Last name
- `organization_name` - Organization
- `subscription_tier` - free/starter/professional/team
- `stripe_customer_id` - Stripe customer ID
- `proposals_this_month` - Usage tracking
- `created_at` - Account creation date

### **proposals** table:
- `id` - Proposal ID
- `user_id` - Owner
- `project_name` - Project name
- `proposal_text` - Generated proposal
- `project_data` - Original form data (JSON)
- `compliance_report` - Compliance check results (JSON)
- `status` - draft/final/submitted/won/lost
- `created_at` - Generation date

### **saved_grants** table:
- `id` - Saved grant ID
- `user_id` - Owner
- `grant_id` - Grants.gov ID
- `grant_data` - Grant details (JSON)
- `notes` - User notes
- `created_at` - Save date

---

## 🚀 Next Steps

After setup:
1. ✅ Test signup/login
2. ✅ Generate a proposal while logged in
3. ✅ View dashboard
4. ✅ Check proposal history
5. ✅ Test logout

---

## 🐛 Troubleshooting

### "Invalid API key"
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Make sure no extra spaces
- Restart server after changing `.env`

### "Email not verified"
- Check spam folder
- In Supabase Dashboard → Authentication → Settings
- Disable "Confirm email" for testing

### "Row Level Security" errors
- Make sure you ran all the SQL policies
- Check Supabase logs in Dashboard

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Auth Guide: https://supabase.com/docs/guides/auth
- Database Guide: https://supabase.com/docs/guides/database
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security

---

**Your Supabase backend is ready!** 🎉
