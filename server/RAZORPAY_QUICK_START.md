# Razorpay Integration - Setup Guide

## Quick Start

This guide will help you set up Razorpay payments for Menutha Restaurant App.

### Step 1: Install Dependencies

```bash
cd server
npm install razorpay
```

### Step 2: Configure Environment Variables

Create or update `.env` file in the server directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

**Get your credentials:**
1. Go to https://dashboard.razorpay.com/
2. Navigate to Settings → API Keys
3. Copy your Key ID and Key Secret

### Step 3: Database Migrations

Run the SQL migrations to update database schema:

```sql
-- Option A: Using raw SQL (see RAZORPAY_IMPLEMENTATION.md for full SQL)

-- Option B: Let Sequelize handle it automatically on next startup
-- The models are already configured, Sequelize will sync tables on app restart
```

### Step 4: Restart Server

```bash
npm start
```

The server will:
- Load Razorpay routes
- Initialize RazorpayService
- Sync database tables

---

## Key Features Implemented

### ✅ Payment Processing
- Create Razorpay orders with restaurant-level payments
- Verify payment signatures (HMAC-SHA256)
- Handle payment success and failure

### ✅ Commission System
- **2.5% commission** per transaction to Admin/App Provider
- **Zero commission** if restaurant has active subscription
- Commission status tracking (pending, paid, none)

### ✅ Subscription Integration
- Automatically checks for active subscriptions
- Waives commission for subscribed restaurants
- Subscription validity checked at transaction time

### ✅ Transaction Tracking
- Complete payment history per restaurant
- Commission calculations and summaries
- Payment method and status tracking

### ✅ Admin Dashboard Support
- Commission summary endpoint
- Transaction filtering by status and date
- Pending commission tracking

---

## File Structure

```
server/
├── app/
│   ├── models/
│   │   ├── transaction.model.js (extended)
│   │   └── commission.model.js (new)
│   ├── services/
│   │   └── RazorpayService.js (new)
│   ├── controllers/
│   │   └── razorpay.controller.js (new)
│   └── routes/
│       └── razorpay.routes.js (new)
├── RAZORPAY_IMPLEMENTATION.md (comprehensive docs)
├── RAZORPAY_QUICK_START.md (this file)
└── package.json (updated)
```

---

## API Quick Reference

### Create Order
```bash
POST /api/razorpay/create-order
Content-Type: application/json

{
  "restaurantId": 1,
  "orderId": 123,
  "amount": 500.00,
  "description": "Order #123"
}
```

### Verify Payment
```bash
POST /api/razorpay/verify-payment
Content-Type: application/json

{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "signature": "signature_xxx"
}
```

### Get Commission Summary
```bash
GET /api/razorpay/admin/commission-summary?dateFrom=2025-01-01&dateTo=2025-01-31
```

See [RAZORPAY_IMPLEMENTATION.md](./RAZORPAY_IMPLEMENTATION.md) for all endpoints and detailed documentation.

---

## Commission Logic Examples

### Example 1: Payment without subscription
```
Amount: ₹1000
Has Subscription: No
Commission Rate: 2.5%
Commission: ₹1000 × 2.5% = ₹25
Commission Status: pending
Restaurant Receives: ₹1000 (full amount, settled separately)
App Provider: ₹25 (commission tracked)
```

### Example 2: Payment with active subscription
```
Amount: ₹1000
Has Subscription: Yes
Commission Rate: 2.5%
Commission: ₹0 (waived)
Commission Status: none
Restaurant Receives: ₹1000
App Provider: ₹0
```

---

## Testing the Integration

### Test with Razorpay Test Keys

Razorpay provides test keys for development:

1. In dashboard, toggle "Test Mode" in top-right
2. Use the test credentials for development
3. Switch to Live Mode for production

### Test Cards

| Card Number | Expiry | CVV | Status |
|------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future date | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future date | Any 3 digits | Failure |

### Test Payment Flow

1. Create order via POST `/api/razorpay/create-order`
2. Use Razorpay SDK to process payment
3. Verify with POST `/api/razorpay/verify-payment`
4. Check transaction in database

---

## Transaction States

```
Payment Flow:
1. CREATE → Transaction created with status: 'pending'
2. VERIFY → On successful payment verification: 'completed'
3. WEBHOOK → Razorpay confirms: status remains 'completed'

Commission Flow:
1. CREATE → Commission calculated and stored
2. PAYMENT SUCCESS → Status: 'pending' (if no subscription)
3. PAYMENT SUCCESS → Status: 'none' (if has subscription)
4. SETTLEMENT → Status: 'paid' (after admin payout)
```

---

## Database Queries for Common Tasks

### Find pending commissions (Admin use)
```sql
SELECT * FROM transaction 
WHERE commissionStatus = 'pending' 
AND status = 'completed'
ORDER BY date DESC;
```

### Get total commission for a date range
```sql
SELECT 
  SUM(commission) as total_commission,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN hasSubscription = 1 THEN 1 ELSE 0 END) as subscription_orders
FROM transaction
WHERE status = 'completed'
AND date BETWEEN '2025-01-01' AND '2025-01-31';
```

### Get restaurant payment summary
```sql
SELECT 
  restaurantId,
  COUNT(*) as total_orders,
  SUM(amount) as total_amount,
  SUM(commission) as total_commission,
  SUM(CASE WHEN hasSubscription = 1 THEN 1 ELSE 0 END) as subscription_orders
FROM transaction
WHERE status = 'completed'
GROUP BY restaurantId;
```

---

## Troubleshooting

### Issue: "Invalid API Keys"
**Solution:** Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file

### Issue: "Payment signature verification failed"
**Solution:** Ensure RAZORPAY_KEY_SECRET matches the one in Razorpay dashboard

### Issue: Commission not calculated
**Solution:** Check if restaurant has active subscription using:
```sql
SELECT * FROM subscription 
WHERE restaurantId = ? 
AND paymentStatus = 'completed' 
AND endDate >= CURDATE();
```

### Issue: Webhook not triggered
**Solution:** 
1. Ensure webhook URL is publicly accessible
2. Add webhook in Razorpay dashboard: Settings → Webhooks
3. Select events: payment.authorized, payment.captured, payment.failed
4. Verify endpoint returns 200 response

---

## Production Checklist

- [ ] Switch Razorpay keys from Test to Live mode
- [ ] Update `.env` with Live API keys
- [ ] Run database migrations
- [ ] Configure webhook URL in Razorpay dashboard
- [ ] Test end-to-end payment flow
- [ ] Set up commission settlement process
- [ ] Configure SSL/TLS for HTTPS
- [ ] Set up monitoring and logging
- [ ] Document commission settlement workflow
- [ ] Train admin on commission management

---

## Next Steps

1. Read [RAZORPAY_IMPLEMENTATION.md](./RAZORPAY_IMPLEMENTATION.md) for detailed documentation
2. Implement frontend payment modal
3. Set up admin dashboard for commission tracking
4. Configure webhook for real-time payment updates
5. Set up commission settlement process

---

## Support & Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Test Keys**: https://dashboard.razorpay.com/app/keys/live
- **Support Email**: support@razorpay.com

