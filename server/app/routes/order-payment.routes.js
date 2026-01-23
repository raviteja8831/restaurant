module.exports = app => {
  const orderPaymentController = require("../controllers/order-payment.controller.js");

  // Create order with Razorpay payment
  app.post("/api/order/create-with-payment", orderPaymentController.createOrderWithPayment);

  // Verify order payment
  app.post("/api/order/verify-payment", orderPaymentController.verifyOrderPayment);

  // Handle order payment failure
  app.post("/api/order/payment-failed", orderPaymentController.orderPaymentFailed);

  // Get order payment status
  app.get("/api/order/:orderId/payment-status", orderPaymentController.getOrderPaymentStatus);

  // Retry payment for failed order
  app.post("/api/order/:orderId/retry-payment", orderPaymentController.retryOrderPayment);
};
