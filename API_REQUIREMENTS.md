# 🔑 GrantWise AI - Complete API Requirements

**Last Updated:** February 14, 2026

---

## ✅ Can You Use Another Supabase Project?

**YES! Absolutely.** You can use:
- ✅ An existing Supabase project
- ✅ A new Supabase project
- ✅ Multiple projects (dev/staging/prod)

### **What You Need from Supabase:**

1. **Project URL** - `https://xxxxx.supabase.co`
2. **Anon/Public Key** - `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**How to Get Them:**
```
1. Go to your Supabase project
2. Click "Settings" → "API"
3. Copy:
   - Project URL
   - anon/public key (NOT the service_role key)
```

**Add to `.env`:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Required APIs & Services

### **1. OpenAI API** (REQUIRED)

**What:** AI proposal generation  
**Cost:** Pay-as-you-go, ~$0.01-0.10 per proposal  
**Status:** ✅ Already configured in your `.env`

**Setup:**
```bash
# Already have this
OPENAI_API_KEY=sk-proj-your-key-here
```

**Get API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy to `.env`

**Usage Limits:**
- Free trial: $5 credit (expires after 3 months)
- Paid: No limits, pay per token
- Recommended: Set usage limits in OpenAI dashboard

---

### **2. Supabase** (REQUIRED)

**What:** Database + Authentication  
**Cost:** Free tier (50,000 rows, 500MB storage)  
**Status:** ❌ Not configured yet

**What You Need:**
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Setup:**
1. Go to https://supabase.com
2. Create new project (or use existing)
3. Get URL + Anon Key from Settings → API
4. Run SQL schema (see `ACTION_PLAN.md` Phase 2)

**Free Tier Limits:**
- 50,000 rows (plenty for MVP)
- 500MB storage
- 2GB bandwidth/month
- Unlimited API requests

---

### **3. Paddle** (REQUIRED for Payments)

**What:** Payment processing + subscription management  
**Cost:** 5% + $0.50 per transaction  
**Status:** ❌ Not configured yet

**What You Need:**
```bash
PADDLE_API_KEY=your-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=sandbox  # or 'production'
PADDLE_PRODUCT_STARTER=pri_xxxxx
PADDLE_PRODUCT_PROFESSIONAL=pri_xxxxx
PADDLE_PRODUCT_TEAM=pri_xxxxx
```

**Setup:**
1. Go to https://paddle.com
2. Sign up for account
3. Create API key (Developer Tools → Authentication)
4. Create 3 products (Starter, Professional, Team)
5. Copy Price IDs to `.env`

**See:** `PADDLE_SETUP.md` for detailed guide

---

### **4. Grants.gov API** (OPTIONAL - Already Integrated)

**What:** Federal grant search  
**Cost:** FREE ✅  
**Status:** ✅ Already integrated in code

**No API Key Needed!** The Grants.gov API is public.

**Already Working:**
- Grant search by keyword
- Grant details retrieval
- No authentication required

---

### **5. Email Service** (RECOMMENDED)

**What:** Send verification, password reset, welcome emails  
**Cost:** Free tier available  
**Status:** ❌ Not configured yet

**Option A: SendGrid (Recommended)**

**Free Tier:**
- 100 emails/day forever
- Perfect for MVP

**What You Need:**
```bash
SENDGRID_API_KEY=SG.xxxxx
```

**Setup:**
1. Go to https://sendgrid.com
2. Sign up for free account
3. Create API key (Settings → API Keys)
4. Verify sender email
5. Add to `.env`

**Option B: Resend (Alternative)**

**Free Tier:**
- 100 emails/day
- 3,000 emails/month

**What You Need:**
```bash
RESEND_API_KEY=re_xxxxx
```

**Setup:**
1. Go to https://resend.com
2. Sign up
3. Create API key
4. Add domain (or use resend.dev for testing)

---

### **6. Error Tracking** (RECOMMENDED)

**What:** Track errors in production  
**Cost:** Free tier available  
**Status:** ❌ Not configured yet

**Option: Sentry**

**Free Tier:**
- 5,000 errors/month
- 1 user
- 30-day retention

**What You Need:**
```bash
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Setup:**
1. Go to https://sentry.io
2. Create project (Node.js)
3. Copy DSN
4. Add to `.env`

**Integration:**
```bash
npm install @sentry/node
```

---

## 📋 Complete `.env` File

Here's what your complete `.env` should look like:

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3000
NODE_ENV=development
APP_URL=http://localhost:3000

# ============================================
# REQUIRED APIs
# ============================================

# OpenAI (REQUIRED) - AI proposal generation
OPENAI_API_KEY=sk-proj-your-key-here

# Supabase (REQUIRED) - Database + Auth
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Session Secret (REQUIRED) - Generate random string
SESSION_SECRET=your-super-secret-key-change-this-in-production

# ============================================
# PAYMENT (REQUIRED for subscriptions)
# ============================================

# Paddle - Payment processing
PADDLE_API_KEY=your-paddle-api-key
PADDLE_WEBHOOK_SECRET=your-webhook-secret
PADDLE_ENVIRONMENT=sandbox  # or 'production'

# Paddle Product IDs (Price IDs from Paddle dashboard)
PADDLE_PRODUCT_STARTER=pri_xxxxx
PADDLE_PRODUCT_PROFESSIONAL=pri_xxxxx
PADDLE_PRODUCT_TEAM=pri_xxxxx

# ============================================
# EMAIL (RECOMMENDED)
# ============================================

# SendGrid - Email service
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# OR Resend (alternative)
# RESEND_API_KEY=re_xxxxx

# ============================================
# MONITORING (RECOMMENDED)
# ============================================

# Sentry - Error tracking
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# ============================================
# OPTIONAL
# ============================================

# Redis - Caching (for production)
# REDIS_URL=redis://localhost:6379

# Google OAuth (if you want Google login)
# GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=xxxxx
```

---

## 🎯 Priority Order

### **Phase 1: MVP (MUST HAVE)**

1. ✅ **OpenAI** - Already configured
2. ❌ **Supabase** - Need to set up
3. ❌ **Session Secret** - Generate random string

**Can launch MVP with just these 3!**

---

### **Phase 2: Payments (BEFORE CHARGING USERS)**

4. ❌ **Paddle** - Payment processing
   - API Key
   - Webhook Secret
   - 3 Product IDs

---

### **Phase 3: Professional (RECOMMENDED)**

5. ❌ **SendGrid/Resend** - Email service
6. ❌ **Sentry** - Error tracking

---

### **Phase 4: Scale (OPTIONAL)**

7. ❌ **Redis** - Caching
8. ❌ **Google OAuth** - Social login

---

## 💰 Cost Summary

### **Free Tier (MVP)**
```
OpenAI:           $0 (free trial) → $10-50/month (usage)
Supabase:         $0 (free tier)
SendGrid:         $0 (100 emails/day)
Sentry:           $0 (5K errors/month)
Paddle:           5% + $0.50 per transaction only
─────────────────────────────────────────────
TOTAL:            $0-50/month
```

### **Production (Paid Tiers)**
```
OpenAI:           $50-200/month
Supabase Pro:     $25/month
SendGrid:         $20/month (Essentials)
Sentry:           $26/month (Team)
Paddle:           5% + $0.50 per transaction
Hostinger:        $2-5/month
Render:           $7/month
─────────────────────────────────────────────
TOTAL:            $130-285/month + transaction fees
```

---

## 🚀 Quick Start Checklist

### **Today (30 minutes)**

- [ ] Create/use Supabase project
- [ ] Copy URL + Anon Key to `.env`
- [ ] Generate session secret: `openssl rand -base64 32`
- [ ] Test OpenAI key (already have)

### **This Week (2 hours)**

- [ ] Set up Paddle account
- [ ] Create 3 products (Starter, Pro, Team)
- [ ] Copy Price IDs to `.env`
- [ ] Set up SendGrid account
- [ ] Verify sender email

### **Before Launch (1 hour)**

- [ ] Set up Sentry
- [ ] Test all API connections
- [ ] Update production `.env` on Render

---

## 🔒 Security Best Practices

### **Never Commit `.env` to Git**

Already configured in `.gitignore`:
```
.env
```

### **Use Different Keys for Dev/Prod**

**Development:**
```bash
PADDLE_ENVIRONMENT=sandbox
APP_URL=http://localhost:3000
```

**Production:**
```bash
PADDLE_ENVIRONMENT=production
APP_URL=https://yourdomain.com
```

### **Rotate Keys Regularly**

- OpenAI: Every 90 days
- Supabase: Every 6 months
- Paddle: Every year
- Session Secret: Every 6 months

---

## 📞 Getting Help

### **OpenAI Issues**
- Docs: https://platform.openai.com/docs
- Status: https://status.openai.com
- Support: Platform dashboard

### **Supabase Issues**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Support: Dashboard chat

### **Paddle Issues**
- Docs: https://developer.paddle.com
- Support: support@paddle.com
- Slack: Paddle community

### **SendGrid Issues**
- Docs: https://docs.sendgrid.com
- Support: support@sendgrid.com

---

## ✅ Summary

**Can you use another Supabase project?**
- ✅ YES! Any Supabase project works
- Just need URL + Anon Key

**What APIs are needed?**

**REQUIRED:**
1. OpenAI ✅ (already have)
2. Supabase ❌ (need to set up)
3. Paddle ❌ (for payments)

**RECOMMENDED:**
4. SendGrid/Resend (emails)
5. Sentry (error tracking)

**OPTIONAL:**
6. Redis (caching)
7. Google OAuth (social login)

**Total Cost:** $0-50/month (MVP) → $130-285/month (production)

---

**Ready to set up?** Let me know which API you want to configure first!
