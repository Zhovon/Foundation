# 📧 Resend Email Service Setup Guide

**Time Required:** 10 minutes  
**Cost:** FREE (3,000 emails/month)

---

## 🚀 Quick Setup

### **Step 1: Create Resend Account (3 minutes)**

1. Go to https://resend.com
2. Click **Start Building**
3. Sign up with GitHub or email
4. Verify your email

### **Step 2: Get API Key (2 minutes)**

1. In Resend dashboard, click **API Keys**
2. Click **Create API Key**
3. Name: `GrantWise AI`
4. Permission: **Full Access** (or **Sending access** for production)
5. Click **Add**
6. **Copy the API key** (you won't see it again!)

```bash
# Add to your .env file
RESEND_API_KEY=re_123456789_abcdefghijklmnopqrstuvwxyz
```

### **Step 3: Configure Sender Email (5 minutes)**

**Option A: Use Resend's Test Domain (Fastest)**

```bash
# Add to .env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

✅ Works immediately  
⚠️ Emails may go to spam  
⚠️ Shows "via resend.dev" in inbox

**Option B: Use Your Own Domain (Recommended for Production)**

1. In Resend dashboard, click **Domains**
2. Click **Add Domain**
3. Enter your domain: `yourdomain.com`
4. Add DNS records (Resend provides them):
   ```
   Type: TXT
   Name: @
   Value: resend-verification=xxxxx
   
   Type: MX
   Name: @
   Value: feedback-smtp.us-east-1.amazonses.com
   Priority: 10
   ```
5. Wait for verification (5-30 minutes)
6. Update `.env`:
   ```bash
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

---

## 📝 Update Your .env

```bash
# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # or noreply@yourdomain.com
```

---

## ✅ Test Email Service

### **Method 1: Quick Test Script**

Create `test-email.js`:

```javascript
require('dotenv').config();
const { sendWelcomeEmail } = require('./src/services/emailService');

async function test() {
    try {
        await sendWelcomeEmail('your-email@example.com', 'Test User');
        console.log('✅ Email sent successfully!');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
```

Run:
```bash
node test-email.js
```

### **Method 2: Test in Browser**

1. Start server: `npm run dev`
2. Sign up for account
3. Check your email for verification

---

## 📧 Available Email Templates

Your `emailService.js` includes 5 professional templates:

### **1. Verification Email**
```javascript
const { sendVerificationEmail } = require('./src/services/emailService');
await sendVerificationEmail('user@example.com', 'verification-token-123');
```

**When to use:** After user signs up

---

### **2. Password Reset Email**
```javascript
const { sendPasswordResetEmail } = require('./src/services/emailService');
await sendPasswordResetEmail('user@example.com', 'reset-token-456');
```

**When to use:** User clicks "Forgot Password"

---

### **3. Welcome Email**
```javascript
const { sendWelcomeEmail } = require('./src/services/emailService');
await sendWelcomeEmail('user@example.com', 'John Doe');
```

**When to use:** After email verification

---

### **4. Subscription Confirmation**
```javascript
const { sendSubscriptionConfirmation } = require('./src/services/emailService');
await sendSubscriptionConfirmation('user@example.com', 'professional');
```

**When to use:** After successful payment

---

### **5. Usage Limit Warning**
```javascript
const { sendUsageLimitWarning } = require('./src/services/emailService');
await sendUsageLimitWarning('user@example.com', 4, 5);
```

**When to use:** User reaches 80% of proposal limit

---

## 🔗 Integration with Auth Controller

Update `src/controllers/authController.js`:

```javascript
const emailService = require('../services/emailService');

// In signup function
exports.signup = async (req, res) => {
    // ... existing signup code ...
    
    // Send verification email
    if (data.user) {
        await emailService.sendVerificationEmail(
            data.user.email,
            data.user.id // or verification token
        );
    }
    
    // ... rest of code ...
};

// In password reset function
exports.forgotPassword = async (req, res) => {
    // ... generate reset token ...
    
    await emailService.sendPasswordResetEmail(
        email,
        resetToken
    );
};
```

---

## 🔗 Integration with Payment Controller

Update `src/controllers/paymentController.js`:

```javascript
const emailService = require('../services/emailService');

// In handleSubscriptionCreated function
async function handleSubscriptionCreated(data) {
    // ... existing code ...
    
    // Send confirmation email
    await emailService.sendSubscriptionConfirmation(
        user.email,
        tier
    );
    
    // Send welcome email if new user
    if (isNewUser) {
        await emailService.sendWelcomeEmail(
            user.email,
            user.name
        );
    }
}
```

---

## 🎨 Email Template Features

All templates include:

✅ **Professional Design**
- Gradient header
- Responsive layout
- Branded colors (#667eea purple)
- Clean typography

✅ **Clear CTAs**
- Prominent buttons
- Fallback text links
- Mobile-friendly

✅ **Security**
- Expiration notices
- Warning messages
- Clear instructions

✅ **Branding**
- GrantWise AI logo (can add)
- Consistent colors
- Footer with links

---

## 💰 Resend Pricing

### **Free Tier**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ All features included
- ✅ Perfect for MVP

### **Pro Tier ($20/month)**
- 50,000 emails/month
- Unlimited daily sending
- Email analytics
- Priority support

### **When to Upgrade?**
- 100+ signups/day
- 3,000+ emails/month
- Need analytics

---

## 🔍 Monitoring & Debugging

### **View Sent Emails**

1. Go to Resend dashboard
2. Click **Emails**
3. See all sent emails with status:
   - ✅ Delivered
   - ⏳ Queued
   - ❌ Bounced

### **Check Logs**

Your app logs email activity:
```bash
# In logs/combined.log
info: Verification email sent successfully {"email":"user@example.com","id":"re_123"}
```

### **Test Email Delivery**

Use https://www.mail-tester.com:
1. Send test email to address provided
2. Get spam score (aim for 10/10)
3. Fix any issues

---

## 🚨 Troubleshooting

### **"API key not configured"**
- Check `RESEND_API_KEY` in `.env`
- Restart server: `npm run dev`

### **"Email not sent"**
- Check Resend dashboard for errors
- Verify API key has sending permissions
- Check email address is valid

### **"Emails going to spam"**
- Use your own domain (not resend.dev)
- Add SPF/DKIM records
- Warm up your domain (send gradually)

### **"Domain not verified"**
- Check DNS records are correct
- Wait 30 minutes for propagation
- Use `dig` to verify: `dig TXT yourdomain.com`

---

## ✅ Production Checklist

Before going live:

- [ ] Use your own domain (not resend.dev)
- [ ] Add all DNS records (SPF, DKIM, DMARC)
- [ ] Verify domain in Resend
- [ ] Test all 5 email templates
- [ ] Check spam scores (mail-tester.com)
- [ ] Set up email monitoring
- [ ] Add unsubscribe links (if marketing emails)
- [ ] Review Resend's sending limits

---

## 📚 Resources

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Email Best Practices:** https://resend.com/docs/knowledge-base
- **Support:** support@resend.com

---

## 🎯 Next Steps

1. ✅ Install Resend: `npm install resend` (already done)
2. ✅ Create email service (already done)
3. [ ] Get Resend API key
4. [ ] Add to `.env`
5. [ ] Test email sending
6. [ ] Integrate with auth controller
7. [ ] Deploy!

**Estimated time:** 10 minutes to fully working emails! 🚀
