module.exports = (app) => {
  const otp = require("../controllers/otp.controller.js");
  const router = require("express").Router();

  // Send OTP
  router.post("/send", otp.sendOTP);

  // Verify OTP
  router.post("/verify", otp.verifyOTP);

  app.use("/api/otp", router);
};
