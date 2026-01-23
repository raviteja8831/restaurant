module.exports = app => {
  const subscriptionPaymentController = require("../controllers/subscription-payment.controller.js");

  // Create subscription with Razorpay payment
  app.post("/api/subscription/create-with-payment", subscriptionPaymentController.createSubscriptionWithPayment);

  // Verify subscription payment
  app.post("/api/subscription/verify-payment", subscriptionPaymentController.verifySubscriptionPayment);

  // Handle subscription payment failure
  app.post("/api/subscription/payment-failed", subscriptionPaymentController.subscriptionPaymentFailed);
};
