module.exports = app => {
  const razorpayController = require("../controllers/razorpay.controller.js");

  // Create a new Razorpay order
  app.post("/api/razorpay/create-order", razorpayController.createOrder);

  // Verify payment after successful transaction
  app.post("/api/razorpay/verify-payment", razorpayController.verifyPayment);

  // Handle payment failure
  app.post("/api/razorpay/payment-failed", razorpayController.paymentFailed);

  // Get transaction details
  app.get("/api/razorpay/transaction/:transactionId", razorpayController.getTransactionDetails);

  // Get all transactions for a restaurant
  app.get("/api/razorpay/restaurant/:restaurantId/transactions", razorpayController.getRestaurantTransactions);

  // Get payment status
  app.get("/api/razorpay/payment/:paymentId/status", razorpayController.getPaymentStatus);

  // Calculate commission for a specific transaction
  app.get("/api/razorpay/transaction/:transactionId/commission", razorpayController.calculateCommission);

  // Get commission summary for admin dashboard
  app.get("/api/razorpay/admin/commission-summary", razorpayController.getCommissionSummary);

  // Webhook endpoint for Razorpay events
  app.post("/api/razorpay/webhook", razorpayController.webhook);
};
