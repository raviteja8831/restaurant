# Razorpay Payment Integration for All Features

## Overview

Razorpay payment integration has been implemented for:
1. **Subscription** - Restaurant subscription payments
2. **Table Booking** - Table reservation payments
3. **Buffet Booking** - Buffet order payments
4. **Menu Order** - Regular menu item orders

---

## API Endpoints

### 1. SUBSCRIPTION PAYMENT

#### Create Subscription with Razorpay
**Endpoint:** `POST /api/subscription/create-with-payment`

**Request Body:**
```json
{
  "restaurantId": 1,
  "amount": 5000.00,
  "startDate": "2025-01-20",
  "endDate": "2025-02-20"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Subscription created - proceed with payment",
  "data": {
    "subscriptionId": 1,
    "razorpayOrderId": "order_1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 5000.00,
    "currency": "INR",
    "restaurantId": 1,
    "transactionId": 456
  }
}
```

#### Verify Subscription Payment
**Endpoint:** `POST /api/subscription/verify-payment`

**Request Body:**
```json
{
  "subscriptionId": 1,
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Subscription payment verified and activated",
  "data": {
    "subscriptionId": 1,
    "restaurantId": 1,
    "amount": 5000.00,
    "status": "completed",
    "startDate": "2025-01-20",
    "endDate": "2025-02-20"
  }
}
```

#### Handle Subscription Payment Failure
**Endpoint:** `POST /api/subscription/payment-failed`

**Request Body:**
```json
{
  "subscriptionId": 1,
  "razorpayOrderId": "order_1234567890"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Subscription payment failed and subscription deleted",
  "subscriptionId": 1
}
```

---

### 2. TABLE BOOKING PAYMENT

#### Create Table Booking with Razorpay
**Endpoint:** `POST /api/tablebooking/create-with-payment`

**Request Body:**
```json
{
  "userId": 5,
  "restaurantId": 1,
  "selectedTables": [
    {"id": 10, "restaurantId": 1},
    {"id": 11, "restaurantId": 1}
  ],
  "amount": 1000.00,
  "starttime": 1705750200000,
  "endtime": 1705751100000
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Table booking created - proceed with payment",
  "data": {
    "bookingIds": [101, 102],
    "razorpayOrderId": "order_1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 1000.00,
    "currency": "INR",
    "restaurantId": 1,
    "tables": 2,
    "transactionId": 456
  }
}
```

#### Verify Table Booking Payment
**Endpoint:** `POST /api/tablebooking/verify-payment`

**Request Body:**
```json
{
  "bookingId": 101,
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Table booking payment verified and confirmed",
  "data": {
    "bookingIds": [101, 102],
    "restaurantId": 1,
    "userId": 5,
    "tables": 2,
    "amount": 1000.00,
    "status": "booked"
  }
}
```

#### Handle Table Booking Payment Failure
**Endpoint:** `POST /api/tablebooking/payment-failed`

**Request Body:**
```json
{
  "bookingId": 101,
  "razorpayOrderId": "order_1234567890"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Table booking payment failed and bookings cancelled",
  "bookingIds": [101, 102]
}
```

---

### 3. BUFFET BOOKING PAYMENT

#### Create Buffet Order with Razorpay
**Endpoint:** `POST /api/buffet/create-with-payment`

**Request Body:**
```json
{
  "userId": 5,
  "restaurantId": 1,
  "buffetId": 3,
  "persons": 4,
  "totalAmount": 2000.00
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Buffet order created - proceed with payment",
  "data": {
    "buffetOrderId": 15,
    "razorpayOrderId": "order_1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 2000.00,
    "currency": "INR",
    "restaurantId": 1,
    "persons": 4,
    "pricePerPerson": 500.00,
    "transactionId": 456
  }
}
```

#### Verify Buffet Order Payment
**Endpoint:** `POST /api/buffet/verify-payment`

**Request Body:**
```json
{
  "buffetOrderId": 15,
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Buffet order payment verified and confirmed",
  "data": {
    "buffetOrderId": 15,
    "restaurantId": 1,
    "userId": 5,
    "persons": 4,
    "totalAmount": 2000.00,
    "status": "booked"
  }
}
```

#### Handle Buffet Order Payment Failure
**Endpoint:** `POST /api/buffet/payment-failed`

**Request Body:**
```json
{
  "buffetOrderId": 15,
  "razorpayOrderId": "order_1234567890"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Buffet order payment failed and order cancelled",
  "buffetOrderId": 15
}
```

---

### 4. MENU ORDER PAYMENT

#### Create Order with Razorpay
**Endpoint:** `POST /api/order/create-with-payment`

**Request Body:**
```json
{
  "userId": 5,
  "restaurantId": 1,
  "tableId": 10,
  "total": 800.00,
  "orderItems": [
    {
      "id": 1,
      "quantity": 2,
      "comments": "Less spicy"
    },
    {
      "id": 2,
      "quantity": 1,
      "comments": ""
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order created - proceed with payment",
  "data": {
    "orderId": 50,
    "razorpayOrderId": "order_1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 800.00,
    "currency": "INR",
    "restaurantId": 1,
    "itemCount": 2,
    "commission": 20.00,
    "commissionPercentage": 2.5,
    "hasSubscription": false,
    "transactionId": 456
  }
}
```

#### Verify Order Payment
**Endpoint:** `POST /api/order/verify-payment`

**Request Body:**
```json
{
  "orderId": 50,
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order payment verified and confirmed",
  "data": {
    "orderId": 50,
    "restaurantId": 1,
    "userId": 5,
    "total": 800.00,
    "itemCount": 2,
    "status": "CONFIRMED",
    "paymentMethod": "razorpay"
  }
}
```

#### Handle Order Payment Failure
**Endpoint:** `POST /api/order/payment-failed`

**Request Body:**
```json
{
  "orderId": 50,
  "razorpayOrderId": "order_1234567890",
  "errorCode": "PAYMENT_DECLINED",
  "errorDescription": "Card declined by issuer"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order payment failure recorded",
  "data": {
    "orderId": 50,
    "restaurantId": 1,
    "status": "PAYMENT_FAILED",
    "errorCode": "PAYMENT_DECLINED",
    "errorDescription": "Card declined by issuer"
  }
}
```

#### Get Order Payment Status
**Endpoint:** `GET /api/order/:orderId/payment-status`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "orderId": 50,
    "restaurantId": 1,
    "total": 800.00,
    "status": "CONFIRMED",
    "paymentMethod": "razorpay",
    "razorpayOrderId": "order_1234567890",
    "razorpayPaymentId": "pay_1234567890"
  }
}
```

#### Retry Order Payment
**Endpoint:** `POST /api/order/:orderId/retry-payment`

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order ready for payment retry",
  "data": {
    "orderId": 50,
    "razorpayOrderId": "order_new_1234567890",
    "razorpayKeyId": "rzp_test_xxxxx",
    "amount": 800.00,
    "currency": "INR",
    "transactionId": 457
  }
}
```

---

## Status Flow

### Subscription Status Flow
```
pending → completed (after payment verification)
         → (deleted if payment fails)
```

### Table Booking Status Flow
```
payment_pending → booked (after payment verification)
                → (deleted if payment fails)
```

### Buffet Order Status Flow
```
payment_pending → booked (after payment verification)
                → (deleted if payment fails)
```

### Menu Order Status Flow
```
PAYMENT_PENDING → CONFIRMED (after payment verification)
                → PAYMENT_FAILED (if payment fails)
                → PAYMENT_PENDING (retry payment)
```

---

## Features

### Automatic Commission Calculation
- **2.5% commission** is automatically calculated for menu orders
- **Zero commission** if restaurant has active subscription
- Commission tracked in transaction table

### Subscription Awareness
- System automatically checks for active subscription
- No commission charged if subscription is valid
- Commission waiver info returned in responses

### Error Handling
- Signature verification for security
- Input validation on all endpoints
- Proper rollback if payment fails
- Clear error messages

### Multiple Retry Support
- Only menu orders support retry (order-specific)
- Other features delete on failure (one-time attempt)
- Retry creates new Razorpay order

---

## Integration Steps

### Frontend Implementation

1. **Create Order/Booking:**
```javascript
const createBooking = async (bookingData) => {
  const response = await fetch('http://api.example.com/api/{type}/create-with-payment', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });
  return response.json();
};
```

2. **Open Razorpay Checkout:**
```javascript
const openCheckout = async (orderData) => {
  const options = {
    key: orderData.razorpayKeyId,
    amount: orderData.amount * 100, // Convert to paise
    order_id: orderData.razorpayOrderId,
    // ... other options
  };
  RazorpayCheckout.open(options);
};
```

3. **Verify Payment:**
```javascript
const verifyPayment = async (paymentData, type) => {
  const response = await fetch(`http://api.example.com/api/${type}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
  return response.json();
};
```

4. **Handle Failure:**
```javascript
const handlePaymentFailure = async (error, type, itemId) => {
  const response = await fetch(`http://api.example.com/api/${type}/payment-failed`, {
    method: 'POST',
    body: JSON.stringify({
      [`${type}Id`]: itemId,
      razorpayOrderId: error.razorpay_order_id,
      errorCode: error.code,
      errorDescription: error.description
    })
  });
  return response.json();
};
```

---

## Database Fields

### Order Model (Extended)
```
- razorpayOrderId: STRING
- razorpayPaymentId: STRING
- paymentMethod: STRING ('razorpay', etc.)
```

### BuffetOrder Model (Extended)
```
- razorpayPaymentId: STRING
- razorpayOrderId: STRING
```

### TableBooking Model (Extended)
```
- comments: JSON field storing razorpay details
```

### Subscription Model (Existing)
```
- paymentStatus: 'pending', 'completed', 'failed'
- transactionId: Razorpay payment ID
```

---

## Security

- ✅ HMAC-SHA256 signature verification
- ✅ Input validation on all endpoints
- ✅ Restaurant existence check
- ✅ User authorization (implement on frontend)
- ✅ Amount validation
- ✅ Idempotent payment verification

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Missing required fields | Invalid request body |
| 404 | Not found | Resource doesn't exist |
| 400 | Invalid signature | Tampered payment data |
| 500 | Failed to create order | Razorpay API error |
| 400 | Only failed orders can retry | Order status check failed |

---

## Testing

### Test Requests (Using Postman)

**1. Create Order Payment:**
```
POST http://localhost:8080/api/order/create-with-payment
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "tableId": null,
  "total": 500.00,
  "orderItems": [
    {"id": 1, "quantity": 2, "comments": ""}
  ]
}
```

**2. Create Table Booking:**
```
POST http://localhost:8080/api/tablebooking/create-with-payment
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "selectedTables": [
    {"id": 1, "restaurantId": 1}
  ],
  "amount": 500.00
}
```

**3. Create Buffet Order:**
```
POST http://localhost:8080/api/buffet/create-with-payment
Content-Type: application/json

{
  "userId": 1,
  "restaurantId": 1,
  "buffetId": 1,
  "persons": 2,
  "totalAmount": 1000.00
}
```

**4. Create Subscription:**
```
POST http://localhost:8080/api/subscription/create-with-payment
Content-Type: application/json

{
  "restaurantId": 1,
  "amount": 5000.00,
  "startDate": "2025-01-20",
  "endDate": "2025-02-20"
}
```

---

## Summary

| Feature | Endpoints | Status |
|---------|-----------|--------|
| **Subscription** | 3 | ✅ Complete |
| **Table Booking** | 3 | ✅ Complete |
| **Buffet Order** | 3 | ✅ Complete |
| **Menu Order** | 5 | ✅ Complete |
| **Total Endpoints** | **14** | ✅ Complete |

All payment flows have been integrated with Razorpay, replacing UPI entirely.

