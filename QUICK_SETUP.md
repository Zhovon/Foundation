# 🚀 Quick Setup Guide - Get Your APIs

**Time Required:** 30 minutes  
**Cost:** $0 (all free tiers)

---

## ✅ Step 1: Supabase (5 minutes)

**YES, you can use an existing Supabase project!**

### **Option A: Use Existing Project**

1. Go to https://supabase.com/dashboard
2. Select your existing project
3. Click **Settings** → **API**
4. Copy these two values:

```bash
# Copy these to your .env file
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Option B: Create New Project**

1. Go to https://supabase.com
2. Click **Start your project**
3. Create new project:
   - Name: `grantwise-ai`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait 2 minutes for setup
5. Go to **Settings** → **API**
6. Copy URL + Anon Key

### **Create Database Tables**

1. In Supabase dashboard, click **SQL Editor**
2. Click **New query**
3. Paste this SQL:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  paddle_customer_id TEXT,
  paddle_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive',
  proposals_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  organization_name TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own proposals" ON proposals 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create proposals" ON proposals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
```

4. Click **Run**
5. ✅ Done!

---

## ✅ Step 2: OpenAI (Already Done)

You already have this in your `.env`:
```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

**Check your balance:**
1. Go to https://platform.openai.com/usage
2. Make sure you have credits
3. If expired, add payment method

---

## ✅ Step 3: Session Secret (1 minute)

Generate a random secret key:

### **Windows (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### **Mac/Linux:**
```bash
openssl rand -base64 32
```

### **Or use online generator:**
https://randomkeygen.com/ (use "Fort Knox Passwords")

**Add to `.env`:**
```bash
SESSION_SECRET=your-generated-secret-here
```

---

## ✅ Step 4: Test Your Setup (2 minutes)

1. **Update your `.env` file:**
```bash
# Copy from .env.example
cp .env.example .env

# Then edit .env with your actual values
```

2. **Start the server:**
```bash
npm run dev
```

3. **Check the logs:**
```
✅ Supabase client initialized successfully
✅ OpenAI client initialized
🚀 GrantWise AI is running!
📍 Local: http://localhost:3000
```

4. **Test in browser:**
- Go to http://localhost:3000
- Should see landing page instantly

---

## 🎯 You're Ready for MVP!

With just these 3 APIs, you can:
- ✅ Generate proposals (OpenAI)
- ✅ Save user data (Supabase)
- ✅ User authentication (Supabase)
- ✅ Secure sessions (Session Secret)

---

## 📋 Optional APIs (Add Later)

### **Paddle (For Payments)**

**When:** Before you want to charge users  
**Time:** 15 minutes  
**See:** `PADDLE_SETUP.md`

### **SendGrid (For Emails)**

**When:** Before launch (recommended)  
**Time:** 10 minutes

1. Go to https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Create API key
4. Verify sender email
5. Add to `.env`:
```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### **Sentry (For Error Tracking)**

**When:** Before production deploy  
**Time:** 5 minutes

1. Go to https://sentry.io
2. Create project (Node.js)
3. Copy DSN
4. Add to `.env`:
```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## 🔍 Troubleshooting

### **"Supabase client not initialized"**
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- Make sure there are no extra spaces
- Restart server: `npm run dev`

### **"OpenAI API error"**
- Check API key is valid
- Check you have credits: https://platform.openai.com/usage
- Check for typos in `.env`

### **"Session secret required"**
- Make sure `SESSION_SECRET` is set in `.env`
- Must be at least 32 characters
- Restart server after adding

---

## ✅ Checklist

**Required for MVP:**
- [ ] Supabase URL + Anon Key in `.env`
- [ ] OpenAI API key in `.env`
- [ ] Session secret generated
- [ ] Database tables created
- [ ] Server starts without errors
- [ ] Landing page loads

**Recommended before launch:**
- [ ] SendGrid API key (emails)
- [ ] Sentry DSN (error tracking)
- [ ] Paddle account (payments)

**Optional:**
- [ ] Redis (caching)
- [ ] Google OAuth (social login)

---

## 💰 Current Costs

With just the required APIs:

```
Supabase Free:    $0
OpenAI:           $10-50/month (usage-based)
SendGrid Free:    $0
Sentry Free:      $0
─────────────────────────────
TOTAL:            $10-50/month
```

**You can launch MVP for ~$10/month!**

---

## 🚀 Next Steps

1. ✅ Set up Supabase (5 min)
2. ✅ Generate session secret (1 min)
3. ✅ Test server (2 min)
4. 📝 Create auth pages (see `ACTION_PLAN.md`)
5. 🚀 Deploy!

**Questions?** Check `API_REQUIREMENTS.md` for detailed info.
