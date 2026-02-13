# Paddle Configuration for GrantWise AI

## 🔗 **URLs for Paddle Setup**

### **Production URLs (use these in Paddle):**

```
Base URL: https://grantwise-ai.onrender.com
(or https://aig.zhovon.com when custom domain is set up)

Website URL: https://grantwise-ai.onrender.com
Webhook URL: https://grantwise-ai.onrender.com/api/payment/webhook
Success URL: https://grantwise-ai.onrender.com/payment/success?tier={tier}
Cancel URL: https://grantwise-ai.onrender.com/pricing
```

---

## 📋 **Complete Page Structure**

### **Public Pages:**
- **Home:** `https://grantwise-ai.onrender.com/`
- **Pricing:** `https://grantwise-ai.onrender.com/pricing`
- **Generate:** `https://grantwise-ai.onrender.com/generate`
- **Results:** `https://grantwise-ai.onrender.com/result`
- **Find Grants:** `https://grantwise-ai.onrender.com/grants`

### **Authentication Pages:**
- **Login:** `https://grantwise-ai.onrender.com/login`
- **Signup:** `https://grantwise-ai.onrender.com/signup` (to be created)
- **Dashboard:** `https://grantwise-ai.onrender.com/dashboard` (to be created)
- **Forgot Password:** `https://grantwise-ai.onrender.com/forgot-password` (to be created)

### **Payment Pages:**
- **Payment Success:** `https://grantwise-ai.onrender.com/payment/success`
- **Customer Portal:** Hosted by Paddle (automatic)

### **API Endpoints:**
- **Checkout:** `POST https://grantwise-ai.onrender.com/api/payment/checkout`
- **Webhook:** `POST https://grantwise-ai.onrender.com/api/payment/webhook`
- **Cancel Subscription:** `POST https://grantwise-ai.onrender.com/api/payment/cancel`
- **Customer Portal:** `GET https://grantwise-ai.onrender.com/api/payment/portal`

---

## 🎯 **Paddle Dashboard Configuration**

### **1. General Settings:**
```
Business Name: GrantWise AI
Website URL: https://grantwise-ai.onrender.com
Support Email: support@grantwise.ai
```

### **2. Webhook Configuration:**
```
Notification URL: https://grantwise-ai.onrender.com/api/payment/webhook
Events to Subscribe:
  ✅ transaction.completed
  ✅ subscription.created
  ✅ subscription.updated
  ✅ subscription.canceled
  ✅ subscription.paused
  ✅ subscription.resumed
```

### **3. Checkout Settings:**
```
Success URL: https://grantwise-ai.onrender.com/payment/success?tier={tier}
Cancel URL: https://grantwise-ai.onrender.com/pricing
```

### **4. Product Configuration:**

**Starter Plan:**
```
Name: GrantWise AI - Starter
Description: 5 proposals per month with basic features
Price: $49.00 USD/month
Billing Cycle: Monthly
Trial Period: 14 days (optional)
```

**Professional Plan:**
```
Name: GrantWise AI - Professional
Description: Unlimited proposals with advanced features
Price: $99.00 USD/month
Billing Cycle: Monthly
Trial Period: 14 days (optional)
```

**Team Plan:**
```
Name: GrantWise AI - Team
Description: Team collaboration + unlimited proposals
Price: $199.00 USD/month
Billing Cycle: Monthly
Trial Period: 14 days (optional)
```

---

## 🔄 **Payment Flow**

### **User Journey:**
1. User visits `/pricing`
2. Clicks "Get Started" on a plan
3. JavaScript calls `/api/payment/checkout` with tier
4. Backend creates Paddle transaction
5. User redirects to Paddle checkout page
6. User enters payment details
7. Paddle processes payment + calculates taxes
8. **On Success:**
   - Paddle sends webhook to `/api/payment/webhook`
   - Backend updates user subscription in Supabase
   - User redirects to `/payment/success?tier=starter`
9. **On Cancel:**
   - User redirects to `/pricing`

### **Webhook Flow:**
```
Paddle → POST /api/payment/webhook
       → Verify signature
       → Process event (transaction.completed, etc.)
       → Update Supabase
       → Return 200 OK
```

---

## 💳 **Refund & Cancellation URLs**

### **Customer Portal (Paddle Hosted):**
Paddle provides a hosted customer portal where users can:
- View invoices
- Update payment method
- Cancel subscription
- Request refunds

**Access:**
```javascript
// In your dashboard, provide a link:
GET /api/payment/portal
// Returns: { portalUrl: "https://checkout.paddle.com/customer/..." }
```

### **Cancellation Flow:**
```
User Dashboard → "Cancel Subscription" button
              → POST /api/payment/cancel
              → Paddle cancels at end of billing period
              → Webhook fires: subscription.canceled
              → User downgraded to free tier
```

### **Refund Policy:**
Refunds are handled through Paddle's dashboard:
1. Go to Paddle Dashboard → Transactions
2. Find the transaction
3. Click "Refund"
4. Choose full or partial refund
5. Paddle processes refund automatically

**No custom refund page needed** - Paddle handles it all!

---

## 📧 **Email Notifications**

Paddle automatically sends:
- ✅ Payment confirmation
- ✅ Invoices
- ✅ Subscription renewal reminders
- ✅ Payment failed notifications
- ✅ Refund confirmations
- ✅ Cancellation confirmations

**You don't need to build these!**

---

## 🧪 **Testing URLs**

### **Sandbox Mode:**
```
Webhook: https://grantwise-ai.onrender.com/api/payment/webhook
Success: https://grantwise-ai.onrender.com/payment/success?tier=starter
Cancel: https://grantwise-ai.onrender.com/pricing
```

### **Test Cards:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## ✅ **Paddle Setup Checklist**

- [ ] Create Paddle account (sandbox mode)
- [ ] Add website URL: `https://grantwise-ai.onrender.com`
- [ ] Set up webhook: `https://grantwise-ai.onrender.com/api/payment/webhook`
- [ ] Copy webhook secret to environment variables
- [ ] Create 3 products (Starter, Professional, Team)
- [ ] Copy product Price IDs to environment variables
- [ ] Set success URL: `https://grantwise-ai.onrender.com/payment/success?tier={tier}`
- [ ] Set cancel URL: `https://grantwise-ai.onrender.com/pricing`
- [ ] Test checkout flow with test card
- [ ] Verify webhook fires and updates Supabase
- [ ] Test cancellation flow
- [ ] Switch to production mode when ready

---

## 🎯 **Summary**

**All you need to configure in Paddle:**

1. **Website URL:** `https://grantwise-ai.onrender.com`
2. **Webhook URL:** `https://grantwise-ai.onrender.com/api/payment/webhook`
3. **Success URL:** `https://grantwise-ai.onrender.com/payment/success?tier={tier}`
4. **Cancel URL:** `https://grantwise-ai.onrender.com/pricing`

**Everything else (refunds, invoices, customer portal) is handled by Paddle automatically!**

---

**Ready to set up Paddle with these URLs!** 🚀
