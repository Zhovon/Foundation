# Paddle Payment Integration Setup Guide

## 🚀 Quick Setup (10 minutes)

### Step 1: Create Paddle Account

1. **Go to Paddle:**
   - Visit https://paddle.com
   - Click "Get Started"
   - Sign up for a free account

2. **Choose Sandbox Mode:**
   - Start with Sandbox for testing
   - Switch to Production when ready to go live

### Step 2: Get API Credentials

1. **In Paddle Dashboard:**
   - Go to Developer Tools → Authentication
   - Click "Create API Key"
   - Name: `GrantWise AI`
   - Copy the API key

2. **Get Webhook Secret:**
   - Go to Developer Tools → Notifications
   - Click "Add Notification Destination"
   - URL: `https://your-app.onrender.com/api/payment/webhook`
   - Copy the webhook secret

3. **Add to `.env` file:**
   ```bash
   # Paddle Configuration
   PADDLE_API_KEY=your-api-key-here
   PADDLE_WEBHOOK_SECRET=your-webhook-secret-here
   PADDLE_ENVIRONMENT=sandbox  # or 'production'
   ```

### Step 3: Create Products

1. **Go to Catalog → Products**

2. **Create Starter Plan:**
   - Click "Add Product"
   - Name: `GrantWise AI - Starter`
   - Description: `5 proposals per month`
   - Type: `Subscription`
   - Billing Cycle: `Monthly`
   - Price: `$49.00 USD`
   - Copy the Price ID (starts with `pri_`)

3. **Create Professional Plan:**
   - Name: `GrantWise AI - Professional`
   - Description: `Unlimited proposals`
   - Price: `$99.00 USD`
   - Copy the Price ID

4. **Create Team Plan:**
   - Name: `GrantWise AI - Team`
   - Description: `Team collaboration + unlimited proposals`
   - Price: `$199.00 USD`
   - Copy the Price ID

5. **Add Price IDs to `.env`:**
   ```bash
   PADDLE_PRODUCT_STARTER=pri_xxxxx
   PADDLE_PRODUCT_PROFESSIONAL=pri_xxxxx
   PADDLE_PRODUCT_TEAM=pri_xxxxx
   ```

### Step 4: Update Supabase Schema

Add Paddle fields to users table:

```sql
-- Add Paddle fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_paddle_subscription ON users(paddle_subscription_id);
```

### Step 5: Test in Sandbox

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Go to pricing page:**
   ```
   http://localhost:3000/pricing
   ```

3. **Click "Get Started" on any plan**
   - Should redirect to Paddle checkout
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC

4. **Complete test purchase**
   - Webhook should fire
   - User subscription should update in Supabase

---

## 🎯 Paddle Features You Get

### ✅ **Automatic Tax Handling**
- VAT for EU customers
- Sales tax for US customers
- GST for other countries
- Paddle calculates and remits ALL taxes

### ✅ **Payment Methods**
- Credit/Debit cards (Visa, Mastercard, Amex)
- PayPal
- Apple Pay
- Google Pay
- Wire transfer (for annual plans)

### ✅ **Automatic Invoicing**
- Professional invoices sent automatically
- Tax-compliant receipts
- Custom branding available

### ✅ **Fraud Protection**
- Built-in fraud detection
- Chargeback handling
- PCI compliance

### ✅ **Customer Portal**
- Update payment method
- View invoices
- Cancel subscription
- Hosted by Paddle

---

## 📊 Webhook Events

Paddle will send these events to your webhook:

| Event | What Happens |
|-------|--------------|
| `transaction.completed` | Payment successful - activate subscription |
| `subscription.created` | New subscription started |
| `subscription.updated` | Plan changed or payment method updated |
| `subscription.canceled` | User canceled - downgrade to free |
| `subscription.paused` | Payment failed - pause access |
| `subscription.resumed` | Payment successful again - restore access |

All handled automatically in `paymentController.js`!

---

## 💰 Pricing

### Paddle Fees:
- **5% + $0.50** per transaction
- Includes:
  - Tax handling
  - Invoicing
  - Fraud protection
  - Chargeback handling
  - Customer support

### Example:
**$99/month subscription:**
- Paddle fee: $5.45
- You receive: $93.55
- Paddle handles: Taxes, invoices, compliance

**Worth it?** YES! No accountant fees, no tax filing, no compliance headaches.

---

## 🔒 Security

### Webhook Verification:
```javascript
// Automatically verified in paymentController.js
const isValid = paddle.webhooks.verify(
  req.body,
  signature,
  process.env.PADDLE_WEBHOOK_SECRET
);
```

### Test Mode:
- Sandbox environment for testing
- No real money charged
- Same features as production

---

## 🚀 Going Live

### When ready for production:

1. **Switch to Production Mode:**
   - In Paddle Dashboard → Settings
   - Complete business verification
   - Add payout details

2. **Create Production Products:**
   - Same as sandbox
   - Get new Price IDs

3. **Update Environment Variables:**
   ```bash
   PADDLE_ENVIRONMENT=production
   PADDLE_API_KEY=live_xxxxx
   PADDLE_PRODUCT_STARTER=pri_live_xxxxx
   PADDLE_PRODUCT_PROFESSIONAL=pri_live_xxxxx
   PADDLE_PRODUCT_TEAM=pri_live_xxxxx
   ```

4. **Update Webhook URL:**
   - Point to production URL
   - Get new webhook secret

5. **Test with real card:**
   - Make a small purchase
   - Verify webhook fires
   - Check Supabase updates

---

## 🐛 Troubleshooting

### "Invalid API key"
- Check `PADDLE_API_KEY` in `.env`
- Make sure it matches environment (sandbox vs production)
- Restart server after changing `.env`

### "Webhook signature invalid"
- Check `PADDLE_WEBHOOK_SECRET` in `.env`
- Make sure webhook URL is correct
- Check Paddle dashboard for webhook logs

### "Product not found"
- Check Price IDs in `.env`
- Make sure products are created in Paddle
- Verify environment (sandbox vs production)

### "User not found"
- Make sure user is logged in
- Check session management
- Verify userId in custom_data

---

## 📚 Resources

- **Paddle Docs:** https://developer.paddle.com
- **API Reference:** https://developer.paddle.com/api-reference
- **Webhook Guide:** https://developer.paddle.com/webhooks
- **Testing Guide:** https://developer.paddle.com/concepts/payment-methods/test-cards

---

## ✅ Checklist

Before going live:

- [ ] Paddle account created
- [ ] API key added to `.env`
- [ ] Webhook secret added to `.env`
- [ ] Products created in Paddle
- [ ] Price IDs added to `.env`
- [ ] Supabase schema updated
- [ ] Test purchase completed
- [ ] Webhook verified working
- [ ] Customer portal tested
- [ ] Cancellation flow tested

---

**Your Paddle integration is ready!** 🎉

Paddle handles:
- ✅ Tax compliance (190+ countries)
- ✅ Invoicing
- ✅ Fraud protection
- ✅ Chargebacks
- ✅ Customer support

You focus on:
- ✅ Building great features
- ✅ Growing your business
- ✅ Helping nonprofits win grants
