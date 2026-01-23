module.exports = app => {
  const buffetPaymentController = require("../controllers/buffet-payment.controller.js");

  // Create buffet order with Razorpay payment
  app.post("/api/buffet/create-with-payment", buffetPaymentController.createBuffetOrderWithPayment);

  // Verify buffet order payment
  app.post("/api/buffet/verify-payment", buffetPaymentController.verifyBuffetOrderPayment);

  // Handle buffet order payment failure
  app.post("/api/buffet/payment-failed", buffetPaymentController.buffetOrderPaymentFailed);
};
