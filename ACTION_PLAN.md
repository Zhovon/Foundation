# 🎯 GrantWise AI - Immediate Action Plan

**Goal:** Transform from 70% complete to production-ready in 12-14 hours

---

## 🚨 CRITICAL PATH (Must Complete Before Launch)

### ✅ **Phase 1: Authentication Pages** ⏰ 4 hours

**Create 5 Missing Pages:**

1. **`views/pages/signup.ejs`** (1 hour)
   - Email/password form
   - Google OAuth button
   - Link to login page
   - Match login.ejs design

2. **`views/pages/dashboard.ejs`** (1.5 hours)
   - User profile card
   - Subscription status badge
   - Proposal history table
   - Usage stats (X/Y proposals used)
   - Upgrade CTA for free users
   - Quick actions (New Proposal, View Grants)

3. **`views/pages/forgot-password.ejs`** (30 min)
   - Email input form
   - Submit button
   - Success message

4. **`views/pages/reset-password.ejs`** (30 min)
   - New password form
   - Confirm password field
   - Token validation

5. **`views/pages/profile.ejs`** (30 min)
   - Edit name, email
   - Change password
   - Delete account option

---

### ✅ **Phase 2: Database Setup** ⏰ 1 hour

**Tasks:**
1. Create Supabase project (10 min)
2. Create SQL schema file (20 min)
3. Run schema in Supabase SQL Editor (10 min)
4. Configure RLS policies (10 min)
5. Test connection (10 min)

**SQL Schema:**
```sql
-- Create users table
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

-- Create proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  organization_name TEXT,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create saved_grants table
CREATE TABLE saved_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  grant_id TEXT NOT NULL,
  grant_data JSONB,
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own proposals" ON proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own proposals" ON proposals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own saved grants" ON saved_grants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save grants" ON saved_grants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete saved grants" ON saved_grants FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_proposals_user_id ON proposals(user_id);
CREATE INDEX idx_saved_grants_user_id ON saved_grants(user_id);
CREATE INDEX idx_users_paddle_subscription ON users(paddle_subscription_id);

-- Function to increment proposal count
CREATE OR REPLACE FUNCTION increment_proposals_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET proposals_this_month = proposals_this_month + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly counts (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_proposals()
RETURNS void AS $$
BEGIN
  UPDATE users SET proposals_this_month = 0;
END;
$$ LANGUAGE plpgsql;
```

---

### ✅ **Phase 3: Connect Auth Routes** ⏰ 30 minutes

**Update `src/routes/index.js`:**

```javascript
// Add after existing imports
const authController = require('../controllers/authController');
const { requireAuth, redirectIfAuthenticated, attachUser } = require('../middleware/auth');

// Add global middleware to attach user to all views
router.use(attachUser);

// Auth routes (add after legal pages, before generator)
router.get('/signup', redirectIfAuthenticated, authController.showSignup);
router.post('/signup', authController.signup);
router.get('/login', redirectIfAuthenticated, authController.showLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/auth/google', authController.googleLogin);
router.get('/auth/callback', authController.authCallback);

// Password reset
router.get('/forgot-password', authController.showForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password', authController.showResetPassword);
router.post('/reset-password', authController.resetPassword);

// Dashboard (protected)
router.get('/dashboard', requireAuth, authController.showDashboard);
router.get('/profile', requireAuth, authController.showProfile);
router.post('/profile', requireAuth, authController.updateProfile);
```

---

### ✅ **Phase 4: Proposal Persistence** ⏰ 2 hours

**Update `src/controllers/proposalController.js`:**

```javascript
// In generateProposal() function, after AI generation
const { proposal, parsedGuidelines, metadata } = await openaiService.generateProposal(data);

// Save to database if user is logged in
if (req.session.user) {
  const { supabase } = require('../config/supabase');
  
  // Save proposal
  const { data: savedProposal, error: saveError } = await supabase
    .from('proposals')
    .insert({
      user_id: req.session.user.id,
      project_name: data.projectName,
      organization_name: data.organizationName,
      content: proposal,
      metadata: {
        parsedGuidelines,
        tokensUsed: metadata.tokensUsed,
        model: metadata.model
      }
    })
    .select()
    .single();
  
  if (saveError) {
    logger.error('Failed to save proposal:', saveError);
  } else {
    // Increment usage counter
    await supabase.rpc('increment_proposals_count', { 
      user_id: req.session.user.id 
    });
  }
}

// Store in session for results page
req.session.lastProposal = { proposal, parsedGuidelines, metadata };
```

**Update Dashboard to show proposals:**

```javascript
// In authController.showDashboard()
const { data: proposals } = await supabase
  .from('proposals')
  .select('*')
  .eq('user_id', req.session.user.id)
  .order('created_at', { ascending: false })
  .limit(10);

res.render('pages/dashboard', {
  title: 'Dashboard - GrantWise AI',
  user: req.session.user,
  proposals: proposals || []
});
```

---

### ✅ **Phase 5: Environment Setup** ⏰ 30 minutes

**Tasks:**
1. Create Supabase project → Copy URL + Anon Key
2. Update `.env`:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Test local connection
4. Update Render environment variables

---

### ✅ **Phase 6: Email Service** ⏰ 3 hours

**Setup SendGrid/Resend:**

1. **Install package:**
   ```bash
   npm install @sendgrid/mail
   # or
   npm install resend
   ```

2. **Create `src/services/emailService.js`:**

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'noreply@grantwise.ai';

async function sendVerificationEmail(email, verificationUrl) {
  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject: 'Verify your GrantWise AI account',
    html: `
      <h1>Welcome to GrantWise AI!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  });
}

async function sendPasswordResetEmail(email, resetUrl) {
  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject: 'Reset your GrantWise AI password',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
}

async function sendWelcomeEmail(email, name) {
  await sgMail.send({
    to: email,
    from: FROM_EMAIL,
    subject: 'Welcome to GrantWise AI!',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your account is now active. Start generating winning grant proposals!</p>
      <a href="${process.env.APP_URL}/generate">Create Your First Proposal</a>
    `
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
```

3. **Update authController to send emails**

---

### ✅ **Phase 7: Payment Testing** ⏰ 2 hours

**Tasks:**
1. Create Paddle sandbox account
2. Create 3 products (Starter, Professional, Team)
3. Copy Price IDs to `.env`
4. Test checkout flow
5. Test webhook with Paddle webhook tester
6. Verify subscription updates in Supabase

---

### ✅ **Phase 8: Final Testing** ⏰ 2 hours

**Test Complete User Journey:**

1. **Signup Flow:**
   - [ ] Sign up with email/password
   - [ ] Receive verification email
   - [ ] Verify email
   - [ ] Redirect to dashboard

2. **Proposal Generation:**
   - [ ] Create new proposal
   - [ ] View results
   - [ ] Export to Word/PDF
   - [ ] Proposal saved to database
   - [ ] Usage counter incremented

3. **Dashboard:**
   - [ ] View proposal history
   - [ ] See usage stats
   - [ ] Click on past proposal

4. **Payment:**
   - [ ] Click upgrade
   - [ ] Complete Paddle checkout
   - [ ] Webhook updates subscription
   - [ ] Dashboard shows new tier

5. **Password Reset:**
   - [ ] Request password reset
   - [ ] Receive email
   - [ ] Reset password
   - [ ] Login with new password

---

## 📊 Progress Tracking

### **Completion Checklist**

**Week 1: MVP (12-14 hours)**
- [ ] Day 1: Auth pages (4h)
- [ ] Day 2: Database + Routes (2h)
- [ ] Day 3: Proposal persistence (2h)
- [ ] Day 4: Email service (3h)
- [ ] Day 5: Payment testing (2h)
- [ ] Weekend: Final testing + Deploy (2h)

**Week 2: Quality (15-17 hours)**
- [ ] Testing suite (8h)
- [ ] Error handling (2h)
- [ ] Documentation (3h)
- [ ] Performance (4h)

---

## 🚀 Deployment Steps

### **Pre-Deployment Checklist**

- [ ] All auth pages created
- [ ] Database schema deployed
- [ ] Auth routes connected
- [ ] Proposal saving works
- [ ] Email service configured
- [ ] Paddle products created
- [ ] All environment variables set
- [ ] Manual testing complete

### **Deploy to Render**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Complete MVP - Auth pages, database, payments"
   git push origin main
   ```

2. **Configure Render:**
   - Add all environment variables
   - Set custom domain (optional)
   - Enable auto-deploy

3. **Post-Deployment:**
   - Test production URL
   - Verify Paddle webhooks
   - Monitor logs
   - Fix any issues

---

## 💡 Quick Wins (Do These First)

1. **Create signup.ejs** (1 hour)
   - Copy login.ejs
   - Change form to signup
   - Add name field
   - Update submit handler

2. **Create dashboard.ejs** (1 hour)
   - Simple layout
   - User info card
   - Proposal list
   - Upgrade button

3. **Set up Supabase** (30 min)
   - Create project
   - Run SQL schema
   - Test connection

4. **Connect routes** (15 min)
   - Add auth routes
   - Test signup → login

**Total: 2.75 hours to working auth!**

---

## 🎯 Success Metrics

**MVP Launch (Week 1):**
- ✅ Users can sign up
- ✅ Users can generate proposals
- ✅ Proposals are saved
- ✅ Users can upgrade
- ✅ Payments work

**Production Ready (Week 2):**
- ✅ 70%+ test coverage
- ✅ Error tracking active
- ✅ Documentation complete
- ✅ Performance optimized

**Business Ready (Week 3-4):**
- ✅ 10+ paying customers
- ✅ Analytics dashboard
- ✅ Marketing site live
- ✅ Support system

---

## 📞 Let's Execute!

**Ready to start?** Let me know which phase you want to tackle first:

1. **Auth Pages** (biggest impact)
2. **Database Setup** (unblocks everything)
3. **Email Service** (professional touch)
4. **Payment Testing** (revenue ready)

I'll guide you through each step! 🚀
