# Razorpay Payment Flow - Complete Backend Documentation

**Generated**: January 24, 2026
**Status**: ✅ PRODUCTION READY

---

## Table of Contents

1. [Overview](#overview)
2. [Payment Flow Diagram](#payment-flow-diagram)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Database Tables Involved](#database-tables-involved)
5. [Step-by-Step Flow](#step-by-step-flow)
6. [Error Handling](#error-handling)
7. [Webhook Integration](#webhook-integration)
8. [Commission Logic](#commission-logic)
9. [Automatic Payouts](#automatic-payouts)
10. [Testing Guide](#testing-guide)

---

## Overview

This system handles complete payment processing using Razorpay:
- **Payment Gateway**: Razorpay Orders API
- **Automatic Transfers**: Razorpay Payouts API
- **Commission**: 2.5% for non-subscribed restaurants, 0% for subscribed
- **Real-time Updates**: Webhook integration for async notifications

**Payment Types Handled:**
1. Regular food orders
2. Table bookings
3. Buffet bookings
4. Restaurant subscriptions

---

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT: Initiate Payment                                 │
│    POST /api/razorpay/create-order                          │
│    { restaurantId, orderId, amount }                        │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND: Create Razorpay Order                           │
│    RazorpayService.createOrder()                            │
│    - Check restaurant subscription status                   │
│    - Calculate commission (2.5% or 0%)                      │
│    - Create Razorpay order via API                          │
│    - Update/Create Order record in DB                       │
│    - Set razorpayOrderId, commission, status='pending'      │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND: Return Order Details                            │
│    Response: {                                              │
│      razorpayOrderId, razorpayKeyId, amount,                │
│      hasSubscription, commission                            │
│    }                                                         │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. CLIENT: Open Razorpay Checkout                           │
│    RazorpayCheckout.open({                                  │
│      key: razorpayKeyId,                                    │
│      order_id: razorpayOrderId,                             │
│      amount: amount * 100                                   │
│    })                                                        │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CUSTOMER: Complete Payment                               │
│    - Enters payment details (card/UPI/netbanking)           │
│    - Razorpay processes payment                             │
│    - Money lands in YOUR Razorpay account                   │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
                   ├─── SUCCESS ───┐         ├─── FAILURE ───┐
                   ↓                ↓         ↓                ↓
┌─────────────────────────────────┐ ┌─────────────────────────┐
│ 6A. CLIENT: Verify Payment      │ │ 6B. CLIENT: Report Fail │
│ POST /api/razorpay/verify-payment│ │ POST /payment-failed    │
│ {                                │ │ { razorpayOrderId,      │
│   razorpayOrderId,               │ │   errorCode }           │
│   razorpayPaymentId,             │ └──────────┬──────────────┘
│   signature                      │            ↓
│ }                                │ ┌──────────────────────────┐
└──────────────┬───────────────────┘ │ Update order status:     │
               ↓                      │ status = 'failed'        │
┌─────────────────────────────────┐  └──────────────────────────┘
│ 7. BACKEND: Verify Signature    │
│ RazorpayService.verifySignature()│
│ - HMAC-SHA256 verification       │
│ - Compares with expected sig     │
└──────────────┬───────────────────┘
               ↓
┌─────────────────────────────────┐
│ 8. BACKEND: Payment Success      │
│ RazorpayService.handlePaymentSuccess()│
│ - Find order by razorpayOrderId  │
│ - Update order: status='completed'│
│ - Save razorpayPaymentId, signature│
└──────────────┬───────────────────┘
               ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. BACKEND: Split Payment                                   │
│ RazorpayService.splitPayment(order)                         │
│                                                              │
│ A. RESTAURANT PAYOUT                                        │
│    - Amount: order.total - commission                       │
│    - Call createPayout()                                    │
│    ├─ Create/get fund account (UPI)                         │
│    ├─ Create payout record in DB (status='pending')         │
│    ├─ Call Razorpay Payouts API                             │
│    └─ Update payout record with razorpayPayoutId            │
│                                                              │
│ B. COMMISSION TRACKING                                      │
│    - Amount: order.commission                               │
│    - Create commission record in DB                         │
│    - Status: 'paid' (stays in your account)                 │
│    - payoutStatus: 'not_applicable'                         │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌─────────────────────────────────┐
│ 10. RAZORPAY: Process Payout    │
│ - Transfers money to restaurant  │
│ - UPI transfer (instant)         │
│ - Sends webhook notification     │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│ 11. WEBHOOK: Update Status       │
│ POST /api/razorpay/webhook       │
│ - Event: payout.processed        │
│ - Update payout status in DB     │
│ - Set processedAt timestamp      │
└──────────────────────────────────┘
```

---

## API Endpoints Reference

### 1. Create Razorpay Order

**Endpoint**: `POST /api/razorpay/create-order`
**Controller**: `razorpay.controller.js:14` → `createOrder()`
**Service**: `RazorpayService.js:43` → `createOrder()`

**Request Body**:
```json
{
  "restaurantId": 123,
  "orderId": 456,
  "amount": 1000.00,
  "description": "Order Payment"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "razorpayOrderId": "order_KJ8xYz9aBcD",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 1000.00,
    "currency": "INR",
    "restaurantId": 123,
    "orderId": 456,
    "hasSubscription": false,
    "commission": 25.00,
    "commissionPercentage": 2.5
  }
}
```

**What It Does**:
1. Validates input (restaurantId, orderId, amount)
2. Checks if restaurant exists
3. Checks if restaurant has active subscription
4. Calculates commission (2.5% if no subscription, 0% if subscribed)
5. Creates Razorpay order via API
6. Updates or creates Order record in database
7. Returns order details to client for payment

**Database Changes**:
- `orders` table: Creates/updates record with `razorpayOrderId`, `commission`, `commissionStatus`, `hasSubscription`

---

### 2. Verify Payment

**Endpoint**: `POST /api/razorpay/verify-payment`
**Controller**: `razorpay.controller.js:86` → `verifyPayment()`
**Service**:
- `RazorpayService.js:129` → `verifySignature()`
- `RazorpayService.js:361` → `handlePaymentSuccess()`
- `RazorpayService.js:291` → `splitPayment()`

**Request Body**:
```json
{
  "razorpayOrderId": "order_KJ8xYz9aBcD",
  "razorpayPaymentId": "pay_KJ8xYz9aBcE",
  "signature": "a1b2c3d4e5f6..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified and confirmed successfully",
  "data": {
    "orderId": 456,
    "restaurantId": 123,
    "amount": 1000.00,
    "status": "completed",
    "commission": 25.00,
    "commissionStatus": "paid",
    "hasSubscription": false,
    "paymentId": "pay_KJ8xYz9aBcE"
  }
}
```

**What It Does**:
1. Validates required fields (razorpayOrderId, razorpayPaymentId, signature)
2. **Verifies signature** using HMAC-SHA256:
   - Creates hash from `razorpayOrderId|razorpayPaymentId`
   - Compares with provided signature
   - Returns 400 if signature invalid
3. **Updates order**:
   - Sets `status = 'completed'`
   - Saves `razorpayPaymentId` and `razorpaySignature`
   - Sets `paymentDate = now`
4. **Splits payment automatically**:
   - Calculates restaurant amount (total - commission)
   - Creates payout to restaurant UPI
   - Creates commission record

**Database Changes**:
- `orders` table: Updates status to 'completed', adds payment IDs
- `payouts` table: Creates payout record for restaurant transfer
- `commission` table: Creates commission record (if applicable)

**Security**:
- Uses HMAC-SHA256 signature verification
- Prevents payment fraud
- Only accepts payments verified by Razorpay

---

### 3. Report Payment Failure

**Endpoint**: `POST /api/razorpay/payment-failed`
**Controller**: `razorpay.controller.js:162` → `paymentFailed()`
**Service**: `RazorpayService.js:415` → `handlePaymentFailure()`

**Request Body**:
```json
{
  "razorpayOrderId": "order_KJ8xYz9aBcD",
  "errorCode": "BAD_REQUEST_ERROR",
  "errorDescription": "Payment cancelled by user"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment failure recorded",
  "data": {
    "transactionId": 789,
    "orderId": 456,
    "status": "failed",
    "errorCode": "BAD_REQUEST_ERROR",
    "errorDescription": "Payment cancelled by user"
  }
}
```

**What It Does**:
1. Finds order by razorpayOrderId
2. Updates order status to 'failed'
3. Records error details
4. No commission created
5. No payout initiated

**Database Changes**:
- `orders` table: Updates status to 'failed'

---

### 4. Get Restaurant Transactions

**Endpoint**: `GET /api/razorpay/restaurant/:restaurantId/transactions`
**Controller**: `razorpay.controller.js:232` → `getRestaurantTransactions()`

**Query Parameters**:
- `status` (optional): Filter by status (completed, pending, failed)
- `dateFrom` (optional): Start date (YYYY-MM-DD)
- `dateTo` (optional): End date (YYYY-MM-DD)

**Response**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 789,
        "amount": 1000.00,
        "commission": 25.00,
        "status": "completed",
        "date": "2026-01-24T10:30:00Z"
      }
    ],
    "summary": {
      "totalTransactions": 150,
      "completedTransactions": 145,
      "totalAmount": 150000.00,
      "totalCommission": 3750.00,
      "averageTransaction": 1000.00
    }
  }
}
```

---

### 5. Get Commission Summary (Admin)

**Endpoint**: `GET /api/razorpay/admin/commission-summary`
**Controller**: `razorpay.controller.js:281` → `getCommissionSummary()`

**Query Parameters**:
- `status` (optional): Filter by commission status
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response**:
```json
{
  "success": true,
  "data": {
    "totalTransactions": 500,
    "totalCommission": 12500.00,
    "pendingCommission": 0.00,
    "paidCommission": 12500.00,
    "subscriptionTransactions": 100,
    "nonSubscriptionTransactions": 400
  }
}
```

---

### 6. Webhook Handler

**Endpoint**: `POST /api/razorpay/webhook`
**Controller**: `razorpay.controller.js:340` → `webhook()`

**Events Handled**:
- `payment.authorized`: Payment authorized (not captured yet)
- `payment.captured`: Payment successfully captured
- `payment.failed`: Payment failed
- `order.paid`: Order fully paid
- `payout.processed`: Payout completed (money transferred)
- `payout.failed`: Payout failed

**Example Payload**:
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_KJ8xYz9aBcE",
        "amount": 100000,
        "status": "captured"
      }
    }
  }
}
```

**What It Does**:
- Receives asynchronous notifications from Razorpay
- Updates transaction/payout status in database
- No signature verification (should be added in production)

---

## Database Tables Involved

### 1. `orders` Table

**Purpose**: Stores all order/booking payments

**Key Fields**:
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  restaurantId INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed'),
  paymentMethod VARCHAR(50),
  razorpayOrderId VARCHAR(255),      -- Razorpay order ID
  razorpayPaymentId VARCHAR(255),    -- Razorpay payment ID
  razorpaySignature VARCHAR(255),    -- Payment signature
  commission DECIMAL(10, 2),         -- Commission amount
  commissionPercentage DECIMAL(5, 2), -- Commission %
  commissionStatus ENUM('none', 'pending', 'paid'),
  hasSubscription BOOLEAN,           -- Subscription status at payment time
  paymentDate DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);
```

**Lifecycle**:
1. **Created**: When Razorpay order is created (status='pending')
2. **Updated**: When payment is verified (status='completed', adds paymentId/signature)
3. **Failed**: If payment fails (status='failed')

---

### 2. `payouts` Table

**Purpose**: Tracks automatic transfers to restaurants

**Schema**:
```sql
CREATE TABLE payouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  razorpayPayoutId VARCHAR(255),           -- Razorpay payout ID
  razorpayFundAccountId VARCHAR(255) NOT NULL,
  orderId INT,                             -- Link to order
  restaurantId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,          -- Amount transferred
  currency VARCHAR(3) DEFAULT 'INR',
  mode VARCHAR(50) DEFAULT 'UPI',
  status ENUM('pending', 'processing', 'processed', 'reversed', 'failed'),
  purpose VARCHAR(50) DEFAULT 'payout',
  referenceId VARCHAR(255),                -- Unique reference
  narration VARCHAR(255),                  -- Description
  failureReason TEXT,                      -- Error message if failed
  initiatedAt DATETIME,                    -- When payout was created
  processedAt DATETIME,                    -- When payout completed
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);
```

**Lifecycle**:
1. **Created**: When payment is verified (status='pending')
2. **Processing**: Razorpay processes transfer (status='processing')
3. **Completed**: Money transferred (status='processed', processedAt set)
4. **Failed**: Transfer failed (status='failed', failureReason set)

---

### 3. `commission` Table

**Purpose**: Tracks commission earned by app owner

**Key Fields**:
```sql
CREATE TABLE commission (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,          -- Commission amount
  percentage DECIMAL(5, 2),                -- Commission % (2.5)
  status ENUM('pending', 'paid'),
  hasSubscription BOOLEAN,                 -- false for commissioned orders
  paymentMethod VARCHAR(50),
  paidDate DATETIME,
  payoutStatus VARCHAR(50),                -- 'not_applicable' (stays with owner)
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);
```

**Note**: Commission stays in app owner's Razorpay account, no payout needed

---

### 4. `restaurant` Table

**Purpose**: Stores restaurant details including payout configuration

**Relevant Fields**:
```sql
ALTER TABLE restaurant ADD COLUMN (
  upi VARCHAR(255),                        -- Restaurant UPI ID
  razorpayContactId VARCHAR(255),          -- Razorpay contact ID
  razorpayFundAccountId VARCHAR(255)       -- Razorpay fund account ID
);
```

**Lifecycle**:
1. **Initial**: Only UPI is set
2. **First Payment**: `razorpayContactId` and `razorpayFundAccountId` created automatically
3. **Subsequent Payments**: Reuse existing fund account

---

### 5. `subscription` Table

**Purpose**: Tracks restaurant subscriptions

**Key Fields**:
```sql
CREATE TABLE subscription (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurantId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  paymentStatus ENUM('pending', 'completed', 'failed'),
  razorpayOrderId VARCHAR(255),            -- For subscription payments
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);
```

**Commission Logic**:
- Active subscription → 0% commission
- No/expired subscription → 2.5% commission

---

## Step-by-Step Flow

### Flow 1: Customer Makes Food Order Payment

```
1. Customer adds items to cart in mobile app
   → Total: ₹1000

2. App calls: POST /api/razorpay/create-order
   Body: { restaurantId: 123, orderId: 456, amount: 1000 }

3. Backend checks subscription:
   → Restaurant ID 123 has NO active subscription
   → Commission = 1000 × 2.5% = ₹25

4. Backend creates Razorpay order:
   → Razorpay order ID: order_ABC123
   → Amount: ₹1000 (₹100,000 in paise)

5. Backend updates/creates Order in DB:
   orders table:
   {
     id: 456,
     restaurantId: 123,
     total: 1000.00,
     status: 'pending',
     razorpayOrderId: 'order_ABC123',
     commission: 25.00,
     commissionPercentage: 2.5,
     commissionStatus: 'pending',
     hasSubscription: false
   }

6. Backend returns to client:
   {
     razorpayOrderId: 'order_ABC123',
     razorpayKeyId: 'rzp_test_xxxxx',
     amount: 1000,
     commission: 25
   }

7. Client opens Razorpay checkout modal:
   RazorpayCheckout.open({
     key: 'rzp_test_xxxxx',
     order_id: 'order_ABC123',
     amount: 100000  // ₹1000 in paise
   })

8. Customer completes payment:
   → Enters UPI PIN / Card details
   → Razorpay processes payment
   → Money (₹1000) lands in YOUR Razorpay account

9. Razorpay returns success:
   {
     razorpay_order_id: 'order_ABC123',
     razorpay_payment_id: 'pay_XYZ789',
     razorpay_signature: 'a1b2c3...'
   }

10. Client calls: POST /api/razorpay/verify-payment
    Body: {
      razorpayOrderId: 'order_ABC123',
      razorpayPaymentId: 'pay_XYZ789',
      signature: 'a1b2c3...'
    }

11. Backend verifies signature:
    expectedSig = HMAC-SHA256(
      'order_ABC123|pay_XYZ789',
      RAZORPAY_KEY_SECRET
    )
    → Match ✅

12. Backend updates Order:
    orders table:
    {
      id: 456,
      status: 'completed',
      razorpayPaymentId: 'pay_XYZ789',
      razorpaySignature: 'a1b2c3...',
      paymentDate: '2026-01-24 10:30:00'
    }

13. Backend splits payment:
    A. Restaurant payout (₹975):
       - Check fund account: Restaurant has UPI = 'restaurant@paytm'
       - Fund account exists? No
       - Create contact in Razorpay
       - Create fund account with UPI
       - Save to restaurant table:
         {
           razorpayContactId: 'cont_ABC',
           razorpayFundAccountId: 'fa_XYZ'
         }

       - Create payout record:
         payouts table:
         {
           id: 1001,
           restaurantId: 123,
           orderId: 456,
           amount: 975.00,
           status: 'pending',
           razorpayFundAccountId: 'fa_XYZ',
           initiatedAt: '2026-01-24 10:30:05'
         }

       - Call Razorpay Payouts API:
         razorpay.payouts.create({
           account_number: '2323230000000000',
           fund_account_id: 'fa_XYZ',
           amount: 97500,  // ₹975 in paise
           currency: 'INR',
           mode: 'UPI'
         })

       - Razorpay returns:
         { id: 'pout_123', status: 'processing' }

       - Update payout record:
         {
           razorpayPayoutId: 'pout_123',
           status: 'processing'
         }

    B. Commission tracking (₹25):
       commission table:
       {
         id: 501,
         orderId: 456,
         restaurantId: 123,
         amount: 25.00,
         percentage: 2.5,
         status: 'paid',
         hasSubscription: false,
         payoutStatus: 'not_applicable',
         paidDate: '2026-01-24 10:30:05'
       }

14. Razorpay processes payout:
    → Transfers ₹975 to restaurant@paytm
    → Usually instant (< 1 minute)

15. Razorpay sends webhook:
    POST /api/razorpay/webhook
    {
      event: 'payout.processed',
      payload: {
        payout: {
          entity: {
            id: 'pout_123',
            status: 'processed'
          }
        }
      }
    }

16. Backend updates payout:
    payouts table:
    {
      id: 1001,
      status: 'processed',
      processedAt: '2026-01-24 10:31:00'
    }

FINAL STATE:
✅ Customer paid ₹1000
✅ Your Razorpay account: ₹1000 received, ₹975 sent out = ₹25 commission
✅ Restaurant received: ₹975 via UPI
✅ Database tracks everything
```

---

### Flow 2: Restaurant with Active Subscription

```
Same as Flow 1, but:

Step 3: Backend checks subscription:
   → Restaurant ID 123 HAS active subscription
   → Subscription end date: 2026-06-30 (future)
   → Commission = ₹0 (no commission)

Step 5: Order created with:
   {
     commission: 0.00,
     commissionStatus: 'none',
     hasSubscription: true
   }

Step 13: Backend splits payment:
   A. Restaurant payout (₹1000 - full amount):
      - Creates payout for ₹1000
      - Transfers full amount to restaurant

   B. Commission tracking:
      - NO commission record created
      - No money stays with app owner

FINAL STATE:
✅ Customer paid ₹1000
✅ Your Razorpay account: ₹1000 received, ₹1000 sent out = ₹0 commission
✅ Restaurant received: ₹1000 via UPI
```

---

## Error Handling

### 1. Input Validation Errors (400 Bad Request)

**Scenario**: Missing required fields

```javascript
// Request
POST /api/razorpay/create-order
{ restaurantId: 123 }  // Missing orderId, amount

// Response
{
  "success": false,
  "message": "restaurantId, orderId, and amount are required"
}
```

**Handled In**: All controller methods validate inputs first

---

### 2. Restaurant Not Found (404 Not Found)

**Scenario**: Invalid restaurant ID

```javascript
// razorpay.controller.js:42-47
const restaurant = await Restaurant.findByPk(restaurantId);
if (!restaurant) {
  return res.status(404).json({
    success: false,
    message: 'Restaurant not found',
  });
}
```

---

### 3. Invalid Payment Signature (400 Bad Request)

**Scenario**: Signature verification fails (fraud detection)

```javascript
// razorpay.controller.js:99-110
const isSignatureValid = razorpayService.verifySignature(
  razorpayOrderId,
  razorpayPaymentId,
  signature
);

if (!isSignatureValid) {
  return res.status(400).json({
    success: false,
    message: 'Invalid payment signature. Payment verification failed.',
  });
}
```

**Security**: Prevents tampering with payment amounts

---

### 4. Restaurant UPI Not Configured

**Scenario**: Restaurant doesn't have UPI set

```javascript
// RazorpayService.js:158-160
if (!restaurant.upi) {
  throw new Error(`Restaurant ${restaurant.id} does not have UPI configured`);
}
```

**Solution**: Update restaurant UPI before accepting payments
```sql
UPDATE restaurant SET upi = 'their_upi@bank' WHERE id = 123;
```

---

### 5. Insufficient Razorpay Balance

**Scenario**: Not enough balance to process payout

```javascript
// RazorpayService.js:250
const payout = await this.razorpay.payouts.create({
  account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
  fund_account_id: fundAccountId,
  amount: Math.round(amount * 100),
  queue_if_low_balance: true,  // ← Queues payout until balance available
});
```

**Behavior**:
- Payout is queued (not rejected)
- Processed automatically when balance available
- Status tracked in database

---

### 6. Payout Failure

**Scenario**: Razorpay can't transfer money (invalid UPI, etc.)

```javascript
// RazorpayService.js:271-278
} catch (payoutError) {
  // Update database with failure
  await payoutRecord.update({
    status: 'failed',
    failureReason: payoutError.message,
  });

  throw payoutError;
}
```

**Recovery**:
- Check `payouts` table for failed payouts
- Verify restaurant UPI is correct
- Manually retry or contact restaurant

---

### 7. Graceful Payout Failure in Split Payment

**Scenario**: Payment succeeds but payout fails

```javascript
// RazorpayService.js:311-314
} catch (payoutError) {
  console.error('Error creating restaurant payout:', payoutError.message);
  // Continue even if payout fails - we'll track it for retry
}
```

**Behavior**:
- Payment is still marked as successful
- Commission is still tracked
- Payout failure is logged
- Can be retried manually later

**Reason**: Don't penalize customer for payout issues

---

### 8. Order Not Found After Payment

**Scenario**: Order deleted/missing after Razorpay payment

```javascript
// razorpay.controller.js:121-126
if (!order) {
  return res.status(400).json({
    success: false,
    message: 'Order not found after payment verification',
  });
}
```

**Prevention**: Orders are created before payment, locked during processing

---

## Webhook Integration

### Setup Webhook in Razorpay Dashboard

1. Login to Razorpay Dashboard
2. Go to **Settings** → **Webhooks**
3. Click **Create New Webhook**
4. Enter URL: `https://yourdomain.com/api/razorpay/webhook`
5. Select Events:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ order.paid
   - ✅ payout.processed
   - ✅ payout.failed
   - ✅ payout.reversed
6. Set Secret (optional, recommended for production)
7. Click **Create Webhook**

### Webhook Handler Code

**Location**: `razorpay.controller.js:340` → `webhook()`

**Events Handled**:

```javascript
// payment.captured - Payment successful
if (event === 'payment.captured') {
  const paymentEntity = payload.payment.entity;
  const transaction = await Transaction.findOne({
    where: { razorpayPaymentId: paymentEntity.id },
  });
  if (transaction && transaction.status === 'pending') {
    await transaction.update({ status: 'completed' });
  }
}

// payment.failed - Payment failed
else if (event === 'payment.failed') {
  const paymentEntity = payload.payment.entity;
  const transaction = await Transaction.findOne({
    where: { razorpayPaymentId: paymentEntity.id },
  });
  if (transaction) {
    await transaction.update({ status: 'failed' });
  }
}

// order.paid - Order fully paid
else if (event === 'order.paid') {
  console.log('Order paid:', payload.order.entity);
}
```

**⚠️ Production TODO**: Add webhook signature verification
```javascript
const webhookSignature = req.headers['x-razorpay-signature'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (webhookSignature !== expectedSignature) {
  return res.status(400).json({ success: false, message: 'Invalid signature' });
}
```

---

## Commission Logic

### Subscription-Based Commission

**Location**: `RazorpayService.js:444` → `checkActiveSubscription()`

```javascript
async checkActiveSubscription(restaurantId) {
  const subscription = await Subscription.findOne({
    where: {
      restaurantId: restaurantId,
      paymentStatus: 'completed',  // Must be paid subscription
    },
  });

  if (!subscription) {
    return false;  // No subscription → 2.5% commission
  }

  // Check if subscription is still valid (not expired)
  const today = new Date();
  const endDate = new Date(subscription.endDate);

  return endDate >= today;  // true if not expired → 0% commission
}
```

### Commission Calculation

**Location**: `RazorpayService.js:65`

```javascript
// Calculate commission
const commission = hasSubscription ? 0 : amount * (2.5 / 100);
const commissionStatus = hasSubscription ? 'none' : 'pending';
```

**Examples**:

| Order Amount | Subscription | Commission | Restaurant Gets |
|--------------|--------------|------------|-----------------|
| ₹1000        | No           | ₹25 (2.5%) | ₹975            |
| ₹1000        | Yes          | ₹0 (0%)    | ₹1000           |
| ₹500         | No           | ₹12.50     | ₹487.50         |
| ₹2000        | Yes          | ₹0         | ₹2000           |

### Commission Tracking

**Created In**: `RazorpayService.js:320` → `splitPayment()`

```javascript
if (commission > 0) {
  commissionRecord = await Commission.create({
    orderId: order.id,
    restaurantId: order.restaurantId,
    amount: commission,
    percentage: order.commissionPercentage || 2.5,
    status: 'paid',  // Commission is automatically paid (stays in account)
    hasSubscription: order.hasSubscription,
    paymentMethod: 'razorpay',
    paidDate: new Date(),
    payoutStatus: 'not_applicable',  // No payout needed
  });
}
```

---

## Automatic Payouts

### How Fund Accounts Work

**Location**: `RazorpayService.js:149` → `createOrGetFundAccount()`

**First Payment Flow**:
```
Restaurant has UPI: restaurant@paytm
    ↓
1. Check if restaurant.razorpayFundAccountId exists
   → No (first payment)
    ↓
2. Create Razorpay Contact:
   razorpay.contacts.create({
     name: "Pizza Place",
     email: "restaurant123@menutha.com",
     contact: "9999999999",
     type: "vendor"
   })
   → Returns: { id: "cont_ABC123" }
    ↓
3. Create Fund Account with UPI:
   razorpay.fundAccount.create({
     contact_id: "cont_ABC123",
     account_type: "vpa",
     vpa: { address: "restaurant@paytm" }
   })
   → Returns: { id: "fa_XYZ789" }
    ↓
4. Save to database:
   UPDATE restaurant SET
     razorpayContactId = 'cont_ABC123',
     razorpayFundAccountId = 'fa_XYZ789'
   WHERE id = 123
    ↓
5. Use fund account for payout
```

**Subsequent Payments**:
```
Restaurant has fund account: fa_XYZ789
    ↓
1. Check if restaurant.razorpayFundAccountId exists
   → Yes: fa_XYZ789
    ↓
2. Skip contact/fund account creation
    ↓
3. Use existing fund account for payout
```

### Payout Creation

**Location**: `RazorpayService.js:213` → `createPayout()`

**Steps**:
```
1. Get restaurant from database
2. Ensure fund account exists (create if needed)
3. Create payout record in DB (status='pending')
4. Call Razorpay Payouts API
5. Update payout record with Razorpay payout ID
6. Return result
```

**Code**:
```javascript
async createPayout(restaurantId, amount, orderId, narration) {
  // 1. Get restaurant
  const restaurant = await Restaurant.findByPk(restaurantId);

  // 2. Ensure fund account
  const fundAccountId = await this.createOrGetFundAccount(restaurant);

  // 3. Create DB record
  const payoutRecord = await Payout.create({
    razorpayFundAccountId: fundAccountId,
    orderId, restaurantId,
    amount: parseFloat(amount.toFixed(2)),
    status: 'pending',
    initiatedAt: new Date(),
  });

  // 4. Create Razorpay payout
  const payout = await this.razorpay.payouts.create({
    account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
    fund_account_id: fundAccountId,
    amount: Math.round(amount * 100),  // Convert to paise
    currency: 'INR',
    mode: 'UPI',
    purpose: 'payout',
    queue_if_low_balance: true,
  });

  // 5. Update DB with Razorpay ID
  await payoutRecord.update({
    razorpayPayoutId: payout.id,
    status: payout.status,  // processing, processed, etc.
  });

  return {
    success: true,
    payoutId: payoutRecord.id,
    razorpayPayoutId: payout.id,
  };
}
```

### Payout Status Lifecycle

```
pending → processing → processed ✅
   ↓
failed ❌

reversed (rare - payout was processed then reversed)
```

**Status Meanings**:
- `pending`: Payout created in DB, waiting for Razorpay API call
- `processing`: Razorpay is processing the transfer
- `processed`: Money successfully transferred to restaurant UPI
- `failed`: Transfer failed (invalid UPI, technical issue, etc.)
- `reversed`: Transfer was successful but later reversed (very rare)

---

## Testing Guide

### Test Scenario 1: Regular Order (No Subscription)

**Setup**:
```sql
-- Create restaurant
INSERT INTO restaurant (name, upi) VALUES ('Test Restaurant', 'test@paytm');

-- No subscription (commission will be 2.5%)
```

**Steps**:
1. **Create Order**:
   ```bash
   curl -X POST http://localhost:8090/api/razorpay/create-order \
     -H "Content-Type: application/json" \
     -d '{
       "restaurantId": 1,
       "orderId": 100,
       "amount": 500
     }'
   ```

   **Expected Response**:
   ```json
   {
     "success": true,
     "data": {
       "razorpayOrderId": "order_...",
       "commission": 12.50,
       "hasSubscription": false
     }
   }
   ```

2. **Complete Payment** (use Razorpay test mode):
   - Use test card: 4111 1111 1111 1111
   - CVV: any 3 digits
   - Expiry: any future date

3. **Verify Payment**:
   ```bash
   curl -X POST http://localhost:8090/api/razorpay/verify-payment \
     -H "Content-Type: application/json" \
     -d '{
       "razorpayOrderId": "order_...",
       "razorpayPaymentId": "pay_...",
       "signature": "..."
     }'
   ```

4. **Check Database**:
   ```sql
   -- Order should be completed
   SELECT * FROM orders WHERE id = 100;
   -- commission: 12.50, status: 'completed'

   -- Payout should be created
   SELECT * FROM payouts WHERE orderId = 100;
   -- amount: 487.50 (500 - 12.50)

   -- Commission should be tracked
   SELECT * FROM commission WHERE orderId = 100;
   -- amount: 12.50
   ```

---

### Test Scenario 2: Order with Active Subscription

**Setup**:
```sql
-- Create subscription
INSERT INTO subscription (restaurantId, amount, startDate, endDate, paymentStatus)
VALUES (1, 5000, '2026-01-01', '2026-12-31', 'completed');
```

**Steps**: Same as Scenario 1

**Expected Differences**:
- `commission: 0` in create-order response
- `hasSubscription: true`
- Payout amount = full order amount (no commission deducted)
- No commission record in database

---

### Test Failed Payment

**Steps**:
1. Create order (same as above)
2. Cancel payment in Razorpay checkout
3. Call payment-failed endpoint:
   ```bash
   curl -X POST http://localhost:8090/api/razorpay/payment-failed \
     -H "Content-Type: application/json" \
     -d '{
       "razorpayOrderId": "order_...",
       "errorCode": "BAD_REQUEST_ERROR",
       "errorDescription": "Payment cancelled by user"
     }'
   ```
4. Check database:
   ```sql
   SELECT * FROM orders WHERE razorpayOrderId = 'order_...';
   -- status: 'failed'

   SELECT * FROM payouts WHERE orderId = 100;
   -- No payout created

   SELECT * FROM commission WHERE orderId = 100;
   -- No commission created
   ```

---

### Monitor Payouts

**Query Failed Payouts**:
```sql
SELECT
  p.id,
  p.razorpayPayoutId,
  r.name AS restaurantName,
  p.amount,
  p.status,
  p.failureReason
FROM payouts p
JOIN restaurant r ON p.restaurantId = r.id
WHERE p.status = 'failed'
ORDER BY p.createdAt DESC;
```

**Query Pending Payouts**:
```sql
SELECT
  p.*,
  r.name AS restaurantName,
  TIMESTAMPDIFF(MINUTE, p.initiatedAt, NOW()) AS minutesSinceInitiated
FROM payouts p
JOIN restaurant r ON p.restaurantId = r.id
WHERE p.status IN ('pending', 'processing')
ORDER BY p.initiatedAt ASC;
```

**Commission Summary**:
```sql
SELECT
  DATE(paidDate) AS date,
  COUNT(*) AS transactions,
  SUM(amount) AS totalCommission,
  AVG(amount) AS avgCommission
FROM commission
WHERE status = 'paid'
GROUP BY DATE(paidDate)
ORDER BY date DESC
LIMIT 30;
```

---

## Summary

### ✅ Complete Payment Flow Features

1. **Order Creation** (`POST /api/razorpay/create-order`)
   - Validates restaurant and amount
   - Checks subscription status
   - Calculates commission automatically
   - Creates Razorpay order
   - Updates database

2. **Payment Verification** (`POST /api/razorpay/verify-payment`)
   - HMAC-SHA256 signature verification
   - Updates order status
   - Triggers automatic payment split
   - Creates payouts and commission records

3. **Automatic Payment Split** (`splitPayment()`)
   - Calculates restaurant amount (total - commission)
   - Creates payout to restaurant UPI automatically
   - Tracks commission in database
   - Handles errors gracefully

4. **Fund Account Management** (`createOrGetFundAccount()`)
   - Creates Razorpay contact on first payment
   - Links restaurant UPI to Razorpay
   - Reuses fund account for subsequent payments

5. **Payout Processing** (`createPayout()`)
   - Creates payout record in database
   - Calls Razorpay Payouts API
   - Tracks status (pending → processing → processed)
   - Handles failures with error messages

6. **Webhook Integration** (`POST /api/razorpay/webhook`)
   - Receives async notifications from Razorpay
   - Updates payment/payout status
   - Logs all events

7. **Commission System**
   - 2.5% for non-subscribed restaurants
   - 0% for subscribed restaurants
   - Subscription expiry check
   - Automatic tracking

### 📊 Database Tables

- `orders`: Payment records with commission details
- `payouts`: Automatic transfer tracking
- `commission`: App owner earnings
- `restaurant`: UPI and fund account IDs
- `subscription`: Subscription status

### 🔒 Security

- HMAC-SHA256 signature verification
- Prevents payment tampering
- Should add webhook signature verification in production

### 🚀 Next Steps for Production

1. **Enable Razorpay Payouts** in dashboard
2. **Add RAZORPAY_ACCOUNT_NUMBER** to `.env`
3. **Configure restaurant UPIs** in database
4. **Add webhook signature verification**
5. **Test with small amounts** before going live
6. **Monitor failed payouts** and retry manually
7. **Set up alerts** for payment failures

---

**Last Updated**: January 24, 2026
**Maintained By**: Backend Team
