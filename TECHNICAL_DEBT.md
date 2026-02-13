# 🔧 GrantWise AI - Technical Debt & Improvements

**Purpose:** Track known issues, technical debt, and future improvements  
**Last Updated:** February 14, 2026

---

## 🚨 Critical Issues (Fix Before Launch)

### 1. **Missing Authentication Pages**
**Severity:** 🔴 CRITICAL  
**Impact:** Users cannot sign up or access accounts  
**Effort:** 4 hours  
**Files Needed:**
- `views/pages/signup.ejs`
- `views/pages/dashboard.ejs`
- `views/pages/forgot-password.ejs`
- `views/pages/reset-password.ejs`
- `views/pages/profile.ejs`

**Action:** Create pages matching `login.ejs` design

---

### 2. **Database Not Deployed**
**Severity:** 🔴 CRITICAL  
**Impact:** No data persistence  
**Effort:** 1 hour  
**Tasks:**
- Create Supabase project
- Deploy SQL schema
- Configure RLS policies
- Test connection

**Action:** See `ACTION_PLAN.md` Phase 2

---

### 3. **Auth Routes Not Connected**
**Severity:** 🔴 CRITICAL  
**Impact:** Auth pages not accessible  
**Effort:** 30 minutes  
**File:** `src/routes/index.js`

**Action:** Add auth routes (see `ACTION_PLAN.md` Phase 3)

---

### 4. **Proposals Not Saved**
**Severity:** 🔴 CRITICAL  
**Impact:** Users lose their work  
**Effort:** 2 hours  
**Files:**
- `src/controllers/proposalController.js`
- `src/controllers/authController.js` (dashboard)

**Action:** Add database insert after AI generation

---

## 🟡 High Priority (Fix Within 2 Weeks)

### 5. **No Test Coverage**
**Severity:** 🟡 HIGH  
**Impact:** Quality risk, bugs in production  
**Effort:** 8 hours  
**Coverage Target:** 70%+

**Missing Tests:**
```
tests/
├── unit/
│   ├── services/
│   │   ├── openaiService.test.js       ❌
│   │   ├── exportService.test.js       ❌
│   │   ├── grantsService.test.js       ❌
│   │   └── guidelinesParser.test.js    ❌
│   └── utils/
│       └── validators.test.js          ❌
├── integration/
│   ├── auth.test.js                    ❌
│   ├── proposals.test.js               ❌
│   ├── payments.test.js                ❌
│   └── exports.test.js                 ❌
└── e2e/
    ├── signup-flow.test.js             ❌
    ├── proposal-generation.test.js     ❌
    └── payment-flow.test.js            ❌
```

**Action:** Set up Jest + Supertest, write critical path tests

---

### 6. **No Email Service**
**Severity:** 🟡 HIGH  
**Impact:** Unprofessional, security risk  
**Effort:** 3 hours

**Missing Emails:**
- Email verification after signup
- Password reset emails
- Welcome email for new users
- Subscription confirmation
- Usage limit warnings

**Action:** Integrate SendGrid/Resend (see `ACTION_PLAN.md` Phase 6)

---

### 7. **No Error Tracking**
**Severity:** 🟡 HIGH  
**Impact:** Can't debug production issues  
**Effort:** 2 hours

**Missing:**
- Sentry integration
- Error alerting
- Performance monitoring
- User feedback on errors

**Action:** Add Sentry SDK, configure error boundaries

---

### 8. **Hardcoded Configuration**
**Severity:** 🟡 HIGH  
**Impact:** Difficult to maintain  
**Effort:** 1 hour

**Issues:**
```javascript
// src/config/constants.js
const PRICING_TIERS = {
  free: { price: 0, proposals: 1 },
  starter: { price: 49, proposals: 5 },
  professional: { price: 99, proposals: Infinity },
  team: { price: 199, proposals: Infinity }
};
```

**Problem:** Prices hardcoded, can't change without code deploy

**Solution:** Move to database or environment variables

---

## 🟢 Medium Priority (Fix Within 1 Month)

### 9. **No API Rate Limiting Per User**
**Severity:** 🟢 MEDIUM  
**Impact:** Users can abuse API  
**Effort:** 2 hours

**Current:** Global rate limiting only  
**Needed:** Per-user rate limiting based on tier

**Solution:**
```javascript
// src/middleware/rateLimiter.js
const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    if (!req.session.user) return 5; // Anonymous
    const tier = req.session.user.subscription_tier;
    return TIER_LIMITS[tier] || 5;
  },
  keyGenerator: (req) => req.session.user?.id || req.ip
});
```

---

### 10. **No Caching**
**Severity:** 🟢 MEDIUM  
**Impact:** Slow performance, high costs  
**Effort:** 4 hours

**Missing:**
- Grant data caching (Grants.gov API is slow)
- User session caching
- Proposal template caching

**Solution:** Add Redis
```javascript
// src/services/cacheService.js
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

async function cacheGrants(keyword, grants) {
  await client.setEx(`grants:${keyword}`, 3600, JSON.stringify(grants));
}

async function getCachedGrants(keyword) {
  const cached = await client.get(`grants:${keyword}`);
  return cached ? JSON.parse(cached) : null;
}
```

---

### 11. **No Database Migrations**
**Severity:** 🟢 MEDIUM  
**Impact:** Hard to update schema  
**Effort:** 3 hours

**Current:** Manual SQL in Supabase  
**Needed:** Migration system

**Solution:** Use Supabase migrations
```bash
supabase migration new add_user_preferences
supabase migration up
```

---

### 12. **No Monitoring Dashboard**
**Severity:** 🟢 MEDIUM  
**Impact:** Can't track system health  
**Effort:** 4 hours

**Missing:**
- Uptime monitoring
- API response times
- Error rates
- User activity

**Solution:** Integrate Grafana or Datadog

---

### 13. **No Backup Strategy**
**Severity:** 🟢 MEDIUM  
**Impact:** Data loss risk  
**Effort:** 2 hours

**Missing:**
- Database backups
- Backup restoration testing
- Disaster recovery plan

**Solution:** Configure Supabase automated backups

---

## 🔵 Low Priority (Nice to Have)

### 14. **No Admin Dashboard**
**Severity:** 🔵 LOW  
**Impact:** Manual user management  
**Effort:** 8 hours

**Missing:**
- User management UI
- Subscription management
- Usage analytics
- Support tools

**Solution:** Build admin panel or use Retool

---

### 15. **No API Documentation**
**Severity:** 🔵 LOW  
**Impact:** Hard for developers to integrate  
**Effort:** 4 hours

**Missing:**
- OpenAPI/Swagger docs
- API examples
- SDK for common languages

**Solution:** Add Swagger UI

---

### 16. **No Mobile Optimization**
**Severity:** 🔵 LOW  
**Impact:** Poor mobile UX  
**Effort:** 6 hours

**Issues:**
- Multi-step form hard to use on mobile
- Results page text too small
- Dashboard not optimized

**Solution:** Responsive design improvements

---

### 17. **No Internationalization (i18n)**
**Severity:** 🔵 LOW  
**Impact:** English-only limits market  
**Effort:** 12 hours

**Missing:**
- Multi-language support
- Currency conversion
- Date/time localization

**Solution:** Add i18next

---

### 18. **No Dark Mode Persistence**
**Severity:** 🔵 LOW  
**Impact:** User preference not saved  
**Effort:** 1 hour

**Current:** Dark mode toggle works but resets on refresh  
**Solution:** Save preference to localStorage or database

---

## 🐛 Known Bugs

### Bug #1: Session Timeout Not Handled
**Severity:** 🟡 MEDIUM  
**Impact:** Users get errors instead of redirect to login  
**Reproduction:**
1. Log in
2. Wait 24 hours (session expires)
3. Try to generate proposal
4. Get error instead of redirect

**Fix:**
```javascript
// src/middleware/auth.js
exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Your session expired. Please log in again.');
    return res.redirect('/login');
  }
  next();
};
```

---

### Bug #2: Export Buttons Don't Show Loading State
**Severity:** 🔵 LOW  
**Impact:** Users click multiple times  
**Reproduction:**
1. Generate proposal
2. Click "Export to Word"
3. Button doesn't show loading
4. Users click again

**Fix:**
```javascript
// public/js/main.js
async function exportToWord() {
  const btn = document.querySelector('.export-word-btn');
  btn.disabled = true;
  btn.textContent = 'Generating...';
  
  try {
    await fetch('/export/word');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Export to Word';
  }
}
```

---

### Bug #3: Grants.gov API Sometimes Times Out
**Severity:** 🟡 MEDIUM  
**Impact:** Grant search fails  
**Reproduction:**
1. Search for grants
2. Sometimes gets 504 timeout
3. No retry logic

**Fix:**
```javascript
// src/services/grantsService.js
async function searchGrantsWithRetry(keyword, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await searchGrants(keyword);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 🔒 Security Improvements

### 1. **Add CSRF Protection**
**Severity:** 🟡 HIGH  
**Effort:** 2 hours

**Missing:** CSRF tokens on forms  
**Solution:** Add `csurf` middleware

---

### 2. **Add Content Security Policy**
**Severity:** 🟡 HIGH  
**Effort:** 1 hour

**Current:** Basic CSP  
**Needed:** Stricter CSP with nonce for inline scripts

---

### 3. **Add Request Validation**
**Severity:** 🟡 HIGH  
**Effort:** 3 hours

**Missing:** Input sanitization on all endpoints  
**Solution:** Add validation middleware to all routes

---

### 4. **Add Audit Logging**
**Severity:** 🟢 MEDIUM  
**Effort:** 4 hours

**Missing:** Log of user actions (login, proposal generation, payments)  
**Solution:** Create audit_logs table

---

## 📊 Performance Improvements

### 1. **Optimize Database Queries**
**Severity:** 🟢 MEDIUM  
**Effort:** 3 hours

**Issues:**
- Missing indexes on foreign keys
- N+1 queries in dashboard
- No query result caching

**Solution:** Add indexes, use `.select()` wisely

---

### 2. **Lazy Load Images**
**Severity:** 🔵 LOW  
**Effort:** 1 hour

**Current:** All images load immediately  
**Solution:** Add `loading="lazy"` attribute

---

### 3. **Minify CSS/JS**
**Severity:** 🔵 LOW  
**Effort:** 2 hours

**Current:** Unminified assets  
**Solution:** Add build step with Webpack/Vite

---

### 4. **Add CDN for Static Assets**
**Severity:** 🔵 LOW  
**Effort:** 2 hours

**Current:** Served from Render  
**Solution:** Use Cloudflare CDN

---

## 📝 Code Quality Improvements

### 1. **Add JSDoc Comments**
**Severity:** 🟢 MEDIUM  
**Effort:** 4 hours

**Current:** Some functions documented  
**Target:** All public functions documented

---

### 2. **Extract Magic Numbers**
**Severity:** 🟢 MEDIUM  
**Effort:** 2 hours

**Issues:**
```javascript
// Bad
if (used >= 5) { ... }

// Good
const STARTER_TIER_LIMIT = 5;
if (used >= STARTER_TIER_LIMIT) { ... }
```

---

### 3. **Reduce Code Duplication**
**Severity:** 🟢 MEDIUM  
**Effort:** 3 hours

**Issues:**
- Similar error handling in multiple controllers
- Repeated Supabase queries
- Duplicate validation logic

**Solution:** Extract to shared utilities

---

## 🎯 Priority Matrix

```
┌─────────────────────────────────────────────────────────┐
│                    IMPACT vs EFFORT                     │
│                                                         │
│ High Impact │  1. Auth Pages       │  5. Testing       │
│             │  2. Database         │  6. Email         │
│             │  3. Routes           │  7. Error Track   │
│             │  4. Persistence      │                   │
│─────────────┼──────────────────────┼───────────────────│
│ Medium      │  8. Config           │ 10. Caching       │
│ Impact      │  9. Rate Limiting    │ 11. Migrations    │
│             │                      │ 12. Monitoring    │
│─────────────┼──────────────────────┼───────────────────│
│ Low Impact  │ 18. Dark Mode        │ 14. Admin Panel   │
│             │                      │ 15. API Docs      │
│             │                      │ 16. Mobile        │
│             │                      │ 17. i18n          │
└─────────────┴──────────────────────┴───────────────────┘
              Low Effort (1-4h)      High Effort (6-12h)
```

**Focus on:** Top-left quadrant (High Impact, Low Effort)

---

## 📅 Suggested Timeline

### **Week 1: Critical Issues**
- [ ] Auth pages (4h)
- [ ] Database setup (1h)
- [ ] Connect routes (0.5h)
- [ ] Proposal persistence (2h)
- [ ] Email service (3h)
- [ ] Payment testing (2h)

### **Week 2: Quality**
- [ ] Testing suite (8h)
- [ ] Error tracking (2h)
- [ ] Security improvements (3h)
- [ ] Bug fixes (2h)

### **Week 3: Performance**
- [ ] Caching (4h)
- [ ] Database optimization (3h)
- [ ] Monitoring (4h)
- [ ] Documentation (3h)

### **Week 4: Polish**
- [ ] Admin dashboard (8h)
- [ ] Mobile optimization (6h)
- [ ] Code cleanup (4h)

---

## 🔄 Continuous Improvements

**Monthly:**
- Review error logs
- Update dependencies
- Security audit
- Performance review

**Quarterly:**
- User feedback review
- Feature prioritization
- Tech debt assessment
- Architecture review

**Annually:**
- Major version upgrades
- Infrastructure review
- Security penetration test
- Disaster recovery drill

---

**This is a living document. Update as issues are fixed and new ones discovered.**
