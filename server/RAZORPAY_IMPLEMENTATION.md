# Razorpay Integration for Menutha Restaurant App

## Overview

This document describes the Razorpay payment gateway integration for the Menutha Restaurant application. The implementation supports:

- **Restaurant-level payments**: Each restaurant receives payment through their account
- **Commission system**: 2.5% commission per transaction to the App Provider (Admin)
- **Subscription handling**: No commission is charged if the restaurant has an active subscription
- **Transaction tracking**: Complete payment history and commission tracking

---

## Architecture

### Flow Diagram

```
1. Customer initiates payment
   ↓
2. Frontend calls POST /api/razorpay/create-order
   ↓
3. Backend creates Razorpay order, saves transaction with:
   - hasSubscription (checked from subscription table)
   - commission (calculated as 0 if subscribed, 2.5% otherwise)
   - commissionStatus (none/pending)
   ↓
4. Frontend opens Razorpay payment modal
   ↓
5. After payment completion/failure:
   - Frontend calls POST /api/razorpay/verify-payment (success)
   - OR calls POST /api/razorpay/payment-failed (failure)
   ↓
6. Backend verifies signature, updates transaction status
   ↓
7. Order status updated to CONFIRMED
```

---

## Environment Variables

Add these to your `.env` file in the server directory:

```env
# Razorpay API Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**How to get these keys:**
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Copy the Key ID and Key Secret
4. Use Key ID in frontend, keep Key Secret secure on backend only

---

## Database Schema Changes

### 1. Transaction Model - Extended Fields

```javascript
{
  // Existing fields
  orderId: INTEGER,
  amount: FLOAT,
  status: STRING,
  date: DATE,

  // New Razorpay fields
  restaurantId: INTEGER (foreign key to restaurant),
  paymentMethod: STRING ('razorpay' default),
  razorpayOrderId: STRING,
  razorpayPaymentId: STRING,
  razorpaySignature: STRING,
  
  // Commission fields
  commission: FLOAT (2.5% of amount if no subscription),
  commissionPercentage: FLOAT (2.5),
  commissionStatus: ENUM('none', 'pending', 'paid'),
  hasSubscription: BOOLEAN (checked at transaction time)
}
```

### 2. Commission Model (New)

Tracks commission details separately for admin accounting:

```javascript
{
  id: PRIMARY KEY,
  transactionId: INTEGER (foreign key),
  restaurantId: INTEGER (foreign key),
  orderId: INTEGER (foreign key),
  amount: FLOAT,
  percentage: FLOAT,
  status: ENUM('pending', 'paid', 'none'),
  hasSubscription: BOOLEAN,
  reason: STRING,
  paidDate: DATE,
  paymentMethod: STRING,
  notes: TEXT,
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## API Endpoints

### 1. Create Razorpay Order

**Endpoint:** `POST /api/razorpay/create-order`

**Purpose:** Initialize payment and create a Razorpay order

**Request Body:**
```json
{
  "restaurantId": 1,
  "orderId": 123,
  "amount": 500.00,
  "description": "Order #123 - Restaurant Name"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "data": {
    "razorpayOrderId": "order_1234567890",
    "razorpayKeyId": "rzp_live_xxxxx",
    "amount": 500.00,
    "currency": "INR",
    "restaurantId": 1,
    "orderId": 123,
    "hasSubscription": false,
    "commission": 12.50,
    "commissionPercentage": 2.5,
    "transactionId": 456
  }
}
```

**Logic:**
- Checks if restaurant exists
- Checks if order exists
- Queries subscription table to determine if restaurant has active subscription
- Calculates commission:
  - If `hasSubscription = true`: commission = 0, commissionStatus = 'none'
  - If `hasSubscription = false`: commission = amount × 2.5%, commissionStatus = 'pending'
- Creates transaction record in database
- Creates order in Razorpay

---

### 2. Verify Payment

**Endpoint:** `POST /api/razorpay/verify-payment`

**Purpose:** Verify payment signature and mark transaction as completed

**Request Body:**
```json
{
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment verified and confirmed successfully",
  "data": {
    "transactionId": 456,
    "orderId": 123,
    "restaurantId": 1,
    "amount": 500.00,
    "status": "completed",
    "commission": 12.50,
    "commissionStatus": "pending",
    "hasSubscription": false,
    "paymentId": "pay_1234567890"
  }
}
```

**Security:**
- Verifies HMAC SHA256 signature using Razorpay secret key
- Prevents payment tampering
- Only updates transaction if signature is valid

**Database Updates:**
- Transaction.status = 'completed'
- Transaction.razorpayPaymentId = payment ID
- Transaction.razorpaySignature = signature
- Order.status = 'CONFIRMED'

---

### 3. Payment Failed

**Endpoint:** `POST /api/razorpay/payment-failed`

**Purpose:** Record payment failure

**Request Body:**
```json
{
  "razorpayOrderId": "order_1234567890",
  "errorCode": "PAYMENT_FAILED",
  "errorDescription": "Card declined by bank"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Payment failure recorded",
  "data": {
    "transactionId": 456,
    "orderId": 123,
    "status": "failed",
    "errorCode": "PAYMENT_FAILED",
    "errorDescription": "Card declined by bank"
  }
}
```

---

### 4. Get Transaction Details

**Endpoint:** `GET /api/razorpay/transaction/:transactionId`

**Purpose:** Retrieve complete transaction and payment details

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": 456,
      "orderId": 123,
      "restaurantId": 1,
      "amount": 500.00,
      "status": "completed",
      "paymentMethod": "razorpay",
      "razorpayOrderId": "order_1234567890",
      "razorpayPaymentId": "pay_1234567890",
      "commission": 12.50,
      "commissionPercentage": 2.5,
      "commissionStatus": "pending",
      "hasSubscription": false,
      "date": "2025-01-20T10:30:00Z"
    },
    "payment": {
      "id": "pay_1234567890",
      "status": "captured",
      "amount": 50000,
      "currency": "INR",
      "method": "card",
      "created_at": 1705750200
    }
  }
}
```

---

### 5. Get Restaurant Transactions

**Endpoint:** `GET /api/razorpay/restaurant/:restaurantId/transactions`

**Query Parameters:**
- `status` (optional): Filter by status (completed, pending, failed)
- `dateFrom` (optional): Start date (ISO format)
- `dateTo` (optional): End date (ISO format)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 456,
        "orderId": 123,
        "amount": 500.00,
        "status": "completed",
        "commission": 12.50,
        "hasSubscription": false,
        "date": "2025-01-20T10:30:00Z"
      }
    ],
    "summary": {
      "totalTransactions": 1,
      "completedTransactions": 1,
      "totalAmount": 500.00,
      "totalCommission": 12.50,
      "averageTransaction": 500.00
    }
  }
}
```

---

### 6. Get Commission Summary (Admin)

**Endpoint:** `GET /api/razorpay/admin/commission-summary`

**Query Parameters:**
- `status` (optional): Filter by status (pending, paid)
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 50,
    "totalCommission": 625.00,
    "pendingCommission": 300.00,
    "paidCommission": 325.00,
    "subscriptionTransactions": 10,
    "nonSubscriptionTransactions": 40
  }
}
```

**Use Case:** Admin dashboard to track pending commissions

---

### 7. Calculate Commission for Transaction

**Endpoint:** `GET /api/razorpay/transaction/:transactionId/commission`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "transactionId": 456,
    "amount": 500.00,
    "commission": 12.50,
    "commissionPercentage": 2.5,
    "commissionStatus": "pending"
  }
}
```

Or if restaurant has subscription:

```json
{
  "success": true,
  "data": {
    "commission": 0,
    "commissionStatus": "none",
    "reason": "Restaurant has active subscription - no commission charged"
  }
}
```

---

### 8. Get Payment Status

**Endpoint:** `GET /api/razorpay/payment/:paymentId/status`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "paymentId": "pay_1234567890",
    "status": "captured",
    "amount": 500.00,
    "currency": "INR",
    "method": "card",
    "createdAt": 1705750200,
    "acquirerId": "HDFC"
  }
}
```

---

### 9. Webhook Endpoint

**Endpoint:** `POST /api/razorpay/webhook`

**Purpose:** Handle Razorpay events (payment.authorized, payment.captured, payment.failed)

**Events Handled:**
- `payment.authorized` - Payment authorized (not captured)
- `payment.captured` - Payment successfully captured
- `payment.failed` - Payment failed
- `order.paid` - Order fully paid

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Configuration in Razorpay Dashboard:**
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourapi.com/api/razorpay/webhook`
3. Select events: payment.captured, payment.failed
4. Copy webhook secret for signature verification (if needed)

---

## Commission Logic

### Calculation Rules

```javascript
// At transaction creation
if (hasActiveSubscription(restaurantId)) {
  commission = 0
  commissionStatus = 'none'
  reason = 'Restaurant has active subscription'
} else {
  commission = amount * 0.025  // 2.5%
  commissionStatus = 'pending'
}
```

### Commission Tracking

1. **Transaction Created**: Commission calculated and stored
2. **Payment Completed**: Transaction marked completed, commission stays as 'pending'
3. **Commission Settlement**: Admin marks commission as 'paid' (separate operation)

### Example Calculations

**Scenario 1: Restaurant without subscription**
```
Order Amount: ₹1000.00
Commission Rate: 2.5%
Commission: ₹25.00
Restaurant Receives: ₹975.00
App Provider Gets: ₹25.00
```

**Scenario 2: Restaurant with active subscription**
```
Order Amount: ₹1000.00
Commission Rate: 2.5%
Commission: ₹0.00 (waived due to subscription)
Restaurant Receives: ₹1000.00
App Provider Gets: ₹0.00
```

---

## Frontend Integration

### Basic Implementation

```javascript
// 1. Import Razorpay SDK in your React Native component
import RazorpayCheckout from 'react-native-razorpay';

// 2. Create order
const createOrder = async (restaurantId, orderId, amount) => {
  try {
    const response = await fetch('http://api.your-domain.com/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        orderId,
        amount
      })
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};

// 3. Open Razorpay checkout
const handlePayment = async (orderDetails) => {
  const options = {
    key: orderDetails.razorpayKeyId,
    amount: orderDetails.amount * 100, // Convert to paise
    currency: 'INR',
    order_id: orderDetails.razorpayOrderId,
    name: 'Menutha',
    description: `Order #${orderDetails.orderId}`,
    prefill: {
      email: userEmail,
      contact: userPhone
    }
  };

  RazorpayCheckout.open(options)
    .then((data) => {
      // Verify payment on backend
      verifyPayment({
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        signature: data.razorpay_signature
      });
    })
    .catch((error) => {
      // Handle payment failure
      console.log('Payment Failed:', error);
      notifyPaymentFailure(orderDetails.razorpayOrderId);
    });
};

// 4. Verify payment
const verifyPayment = async (paymentData) => {
  try {
    const response = await fetch('http://api.your-domain.com/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const data = await response.json();
    if (data.success) {
      showSuccess('Payment successful! Order confirmed.');
      // Update UI, navigate to order confirmation
    } else {
      showError('Payment verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
};
```

---

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid payment signature | Tampered payment data | Check RAZORPAY_KEY_SECRET in .env |
| Order not found | Invalid orderId | Verify order exists before creating Razorpay order |
| Restaurant not found | Invalid restaurantId | Verify restaurant exists in database |
| Razorpay connection error | API keys invalid | Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET |
| Amount mismatch | Amount tampering attempt | Always validate amount on backend |

---

## Database Migration

Add these SQL migrations to set up new tables:

```sql
-- Extend transaction table
ALTER TABLE transaction 
ADD COLUMN restaurantId INT NOT NULL,
ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'razorpay',
ADD COLUMN razorpayOrderId VARCHAR(100),
ADD COLUMN razorpayPaymentId VARCHAR(100),
ADD COLUMN razorpaySignature VARCHAR(255),
ADD COLUMN commission FLOAT DEFAULT 0,
ADD COLUMN commissionPercentage FLOAT DEFAULT 2.5,
ADD COLUMN commissionStatus ENUM('none', 'pending', 'paid') DEFAULT 'none',
ADD COLUMN hasSubscription BOOLEAN DEFAULT FALSE,
ADD FOREIGN KEY (restaurantId) REFERENCES restaurant(id);

-- Create commission table
CREATE TABLE commission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transactionId INT NOT NULL,
  restaurantId INT NOT NULL,
  orderId INT,
  amount FLOAT NOT NULL,
  percentage FLOAT DEFAULT 2.5,
  status ENUM('pending', 'paid', 'none') DEFAULT 'pending',
  hasSubscription BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255),
  paidDate DATETIME,
  paymentMethod VARCHAR(100),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionId) REFERENCES transaction(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id),
  FOREIGN KEY (orderId) REFERENCES order(id)
);

-- Create indexes for faster queries
CREATE INDEX idx_transaction_razorpay_order ON transaction(razorpayOrderId);
CREATE INDEX idx_transaction_razorpay_payment ON transaction(razorpayPaymentId);
CREATE INDEX idx_transaction_restaurant ON transaction(restaurantId);
CREATE INDEX idx_commission_status ON commission(status);
CREATE INDEX idx_commission_restaurant ON commission(restaurantId);
```

---

## Testing

### Test Cases

1. **Happy Path**: Successful payment without subscription
   - Create order → Open payment → Complete payment → Verify → Check commission

2. **Subscription Case**: Successful payment with active subscription
   - Create order → Verify no commission → Complete payment → Verify commission = 0

3. **Failed Payment**: Payment failure handling
   - Create order → Payment fails → Verify status = 'failed'

4. **Signature Verification**: Invalid signature
   - Create order → Tamper payment data → Verify should fail

### Using Postman

```
1. POST /api/razorpay/create-order
   Body: { "restaurantId": 1, "orderId": 1, "amount": 500 }

2. POST /api/razorpay/verify-payment
   Body: { "razorpayOrderId": "...", "razorpayPaymentId": "...", "signature": "..." }

3. GET /api/razorpay/admin/commission-summary
```

---

## Security Best Practices

1. **Never expose RAZORPAY_KEY_SECRET** - Keep it server-side only
2. **Always verify signatures** - Prevent payment tampering
3. **Validate all inputs** - Check restaurantId, orderId, amount
4. **Use HTTPS only** - Encrypt all payment data in transit
5. **Implement rate limiting** - Prevent abuse of payment endpoints
6. **Log all transactions** - Maintain audit trail
7. **Use webhooks securely** - Verify webhook signature

---

## Troubleshooting

### Payment not completing
- Check if Razorpay integration is enabled in your account
- Verify API keys are correct
- Check if amount is in valid range (minimum ₹1)

### Commission not calculated
- Verify subscription check is working: `SELECT * FROM subscription WHERE restaurantId = ? AND paymentStatus = 'completed'`
- Check if subscription endDate is after today

### Webhook not triggered
- Verify webhook URL is accessible from internet
- Check webhook secret configuration
- Review Razorpay dashboard webhook logs

---

## Support

For issues with Razorpay integration:
- **Razorpay Docs**: https://razorpay.com/docs/
- **Razorpay Support**: support@razorpay.com
- **API Status**: https://status.razorpay.com

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-20 | Initial Razorpay integration with 2.5% commission and subscription support |

