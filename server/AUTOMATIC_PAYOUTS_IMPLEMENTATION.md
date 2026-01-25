# Automatic Razorpay Payouts - Implementation Guide

**Date**: January 25, 2026
**Status**: ✅ FULLY IMPLEMENTED WITH AUTOMATIC TRANSFERS

---

## Overview

This system **automatically transfers** money to restaurants after successful payments:
- Customer pays ₹1000
- Razorpay receives ₹1000
- **Automatically transfers ₹975 to restaurant UPI** (if no subscription)
- **App owner keeps ₹25 commission** (stays in Razorpay account)
- **Everything tracked in database**

---

## How It Works

### Payment Flow with Automatic Transfer

```
┌─────────────────────────────────────────────┐
│ Customer pays ₹1000 via Razorpay            │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Money lands in YOUR Razorpay account        │
│ Total: ₹1000                                │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Backend: Payment verification SUCCESS       │
│ - Verify signature                          │
│ - Calculate commission (2.5% or 0%)         │
│ - Call splitPayment()                       │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Create/Get Fund Account for restaurant      │
│ - Check if restaurant.razorpayFundAccountId │
│ - If not exists, create contact + fund acct│
│ - Link restaurant UPI to Razorpay           │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ AUTOMATIC PAYOUT TO RESTAURANT              │
│ - Amount: ₹975 (₹1000 - ₹25 commission)    │
│ - Destination: Restaurant UPI               │
│ - Mode: UPI transfer                        │
│ - Status: Tracked in database               │
└──────────────────┬──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│ Commission tracking in database             │
│ - Amount: ₹25                               │
│ - Status: 'paid'                            │
│ - Stays in your Razorpay account            │
└─────────────────────────────────────────────┘
```

---

## Database Schema

### 1. Restaurant Table (Updated)

```sql
ALTER TABLE restaurant
ADD COLUMN razorpayFundAccountId VARCHAR(255) NULL,
ADD COLUMN razorpayContactId VARCHAR(255) NULL;
```

**Fields:**
- `upi` - Restaurant UPI ID (already exists)
- `razorpayFundAccountId` - Razorpay fund account ID (NEW)
- `razorpayContactId` - Razorpay contact ID (NEW)

### 2. Payouts Table (New)

```sql
CREATE TABLE payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razorpayPayoutId VARCHAR(255),
  razorpayFundAccountId VARCHAR(255) NOT NULL,
  orderId INT,
  restaurantId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'processed', 'reversed', 'failed'),
  failureReason TEXT,
  initiatedAt DATETIME,
  processedAt DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);
```

---

## Code Implementation

### 1. RazorpayService.js - New Methods

#### createOrGetFundAccount(restaurant)
- Checks if restaurant has fund account
- If not, creates Razorpay contact + fund account
- Links restaurant UPI to Razorpay
- Saves IDs to database

####createPayout(restaurantId, amount, orderId, narration)
- Creates payout record in database
- Triggers actual Razorpay payout
- Updates status based on Razorpay response
- Handles failures gracefully

#### splitPayment(order) - UPDATED
- **OLD**: Only tracked commission in database
- **NEW**: Actually transfers money to restaurant UPI
- Creates payout automatically
- Tracks everything in database

---

## Setup Requirements

### 1. Razorpay Account Configuration

**Required Permissions:**
- ✅ Standard Razorpay account
- ✅ Payouts feature enabled
- ✅ Sufficient balance for payouts

**Get Your Account Number:**
1. Login to Razorpay Dashboard
2. Go to Settings → Account
3. Copy "Account Number" (format: `2323230000000000`)

### 2. Environment Variables

Add to `.env`:
```bash
# Existing
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# NEW - Required for payouts
RAZORPAY_ACCOUNT_NUMBER=2323230000000000
```

### 3. Database Migration

```bash
cd /home/ec2-user/server/restaurant/server
mysql -u your_user -p your_database < migrations/add_razorpay_payouts_tracking.sql
```

### 4. Restart Server

```bash
pm2 restart server
# or
npm start
```

---

## Testing

### Test Scenario 1: First Payment (No Fund Account)

1. **Restaurant Setup**:
   - Restaurant has UPI: `test@paytm`
   - No fund account yet

2. **Customer Payment**:
   - Amount: ₹500
   - Commission: ₹12.50 (2.5%)
   - Restaurant gets: ₹487.50

3. **What Happens**:
   ```
   ✅ Payment verified
   ✅ Fund account created for restaurant
   ✅ Payout initiated: ₹487.50 to test@paytm
   ✅ Commission tracked: ₹12.50
   ✅ Database records created
   ```

4. **Database Check**:
   ```sql
   -- Check restaurant fund account created
   SELECT id, name, upi, razorpayFundAccountId
   FROM restaurant WHERE id = 1;

   -- Check payout record
   SELECT * FROM payouts WHERE orderId = 123;

   -- Check commission
   SELECT * FROM commission WHERE orderId = 123;
   ```

### Test Scenario 2: Subsequent Payment (Fund Account Exists)

1. **Restaurant Setup**:
   - Fund account already exists
   - Restaurant has subscription (no commission)

2. **Customer Payment**:
   - Amount: ₹1000
   - Commission: ₹0 (has subscription)
   - Restaurant gets: ₹1000

3. **What Happens**:
   ```
   ✅ Payment verified
   ✅ Uses existing fund account
   ✅ Payout initiated: ₹1000 to restaurant
   ✅ No commission (subscription active)
   ✅ Database updated
   ```

---

## Monitoring & Admin Features

### View All Payouts

```sql
SELECT
  p.id,
  p.razorpayPayoutId,
  r.name AS restaurantName,
  p.amount,
  p.status,
  p.initiatedAt,
  p.processedAt
FROM payouts p
JOIN restaurant r ON p.restaurantId = r.id
ORDER BY p.createdAt DESC
LIMIT 50;
```

### Check Failed Payouts

```sql
SELECT
  p.*,
  r.name AS restaurantName,
  r.upi
FROM payouts p
JOIN restaurant r ON p.restaurantId = r.id
WHERE p.status = 'failed'
ORDER BY p.createdAt DESC;
```

### Commission Summary

```sql
SELECT
  DATE(createdAt) AS date,
  COUNT(*) AS transactions,
  SUM(amount) AS totalCommission
FROM commission
WHERE status = 'paid'
GROUP BY DATE(createdAt)
ORDER BY date DESC;
```

---

## Error Handling

### 1. Restaurant UPI Not Configured

**Error**: `Restaurant X does not have UPI configured`

**Solution**:
```sql
UPDATE restaurant
SET upi = 'restaurant@paytm'
WHERE id = X;
```

### 2. Insufficient Balance

**Error**: `Insufficient balance in Razorpay account`

**What Happens**:
- Payout is queued (`queue_if_low_balance: true`)
- Processed when balance available
- Status tracked in database

**Solution**:
- Add funds to Razorpay account
- Payout will process automatically

### 3. Invalid UPI

**Error**: `Invalid VPA`

**Solution**:
- Verify UPI format: `username@bankname`
- Update restaurant UPI
- Retry payout

---

## Benefits

✅ **Fully Automatic** - No manual transfers needed
✅ **Real-time** - Money transfers immediately after payment
✅ **Tracked** - Everything recorded in database
✅ **Transparent** - Restaurants can see payout status
✅ **Scalable** - Handles unlimited transactions
✅ **Reliable** - Razorpay handles transfer failures

---

## Payment Scenarios

### Scenario 1: Order Without Subscription

```
Customer pays: ₹1000
    ↓
Razorpay receives: ₹1000
    ↓
Commission (2.5%): ₹25 (stays in your account)
    ↓
Auto-transfer to restaurant: ₹975
    ↓
Database records:
  - Order: ₹1000
  - Commission: ₹25 (status: paid)
  - Payout: ₹975 (status: processing/processed)
```

### Scenario 2: Order With Active Subscription

```
Customer pays: ₹1000
    ↓
Razorpay receives: ₹1000
    ↓
Commission: ₹0 (subscription active)
    ↓
Auto-transfer to restaurant: ₹1000 (full amount)
    ↓
Database records:
  - Order: ₹1000
  - Commission: none
  - Payout: ₹1000 (status: processing/processed)
```

---

## Next Steps

1. **Enable Razorpay Payouts**
   - Contact Razorpay support to enable Payouts feature
   - May require KYC verification

2. **Get Account Number**
   - Login to Razorpay Dashboard
   - Settings → Account → Copy account number
   - Add to `.env`

3. **Run Migration**
   ```bash
   mysql -u user -p database < migrations/add_razorpay_payouts_tracking.sql
   ```

4. **Update Restaurant UPIs**
   ```sql
   UPDATE restaurant SET upi = 'their_upi@bank' WHERE id = X;
   ```

5. **Test with Small Amount**
   - Make test payment (₹10)
   - Verify payout in Razorpay dashboard
   - Check database records

6. **Go Live**
   - Switch to live Razorpay keys
   - Monitor first few transactions
   - Set up alerts for failed payouts

---

**Status**: ✅ READY FOR PRODUCTION (after Razorpay account setup)
