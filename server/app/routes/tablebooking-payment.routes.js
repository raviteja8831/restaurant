module.exports = app => {
  const tableBookingPaymentController = require("../controllers/tablebooking-payment.controller.js");

  // Create table booking with Razorpay payment
  app.post("/api/tablebooking/create-with-payment", tableBookingPaymentController.createTableBookingWithPayment);

  // Verify table booking payment
  app.post("/api/tablebooking/verify-payment", tableBookingPaymentController.verifyTableBookingPayment);

  // Handle table booking payment failure
  app.post("/api/tablebooking/payment-failed", tableBookingPaymentController.tableBookingPaymentFailed);
};
