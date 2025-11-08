const { sendOTP, checkOTP, verifyOTP } = require("../services/otp.service");
const db = require("../models");

/**
 * Send OTP to a phone number
 */
exports.sendOTP = async (req, res) => {
  try {
    const { phone, type } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate type
    const validTypes = ["USER_LOGIN", "CUSTOMER_LOGIN", "REGISTRATION"];
    const otpType = type && validTypes.includes(type) ? type : "USER_LOGIN";

    // Validate phone number exists based on type
    if (otpType === "USER_LOGIN") {
      const user = await db.restaurantUser.findOne({ where: { phone } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found with this phone number",
        });
      }
    } else if (otpType === "CUSTOMER_LOGIN") {
      const customer = await db.customer.findOne({ where: { phone } });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found with this phone number",
        });
      }
    }

    const result = await sendOTP(phone, otpType);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in sendOTP controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

/**
 * Verify OTP (just checks validity, doesn't mark as verified)
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, type } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Validate type
    const validTypes = ["USER_LOGIN", "CUSTOMER_LOGIN", "REGISTRATION"];
    const otpType = type && validTypes.includes(type) ? type : "USER_LOGIN";

    // Use checkOTP instead of verifyOTP - this only validates without marking as verified
    const result = await checkOTP(phone, otp, otpType);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in verifyOTP controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
