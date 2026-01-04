const axios = require('axios');
const db = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

// Configure Fast2SMS API
const API_BASE_URL = "https://www.fast2sms.com/dev/bulkV2";
const AUTHORIZATION = process.env.FAST2SMS_AUTH || "S7RUhkpBQcsy0ir6wFfWoaH2NZq84GIxLt5Ym9lOTvgVCEMjbd0eg5Yw6jC1ISusLiTWx4XrFEc9MyZd";
const SENDER_ID = process.env.FAST2SMS_SENDER_ID || "ADMENU";
const ROUTE = "dlt";
const FLASH = 0;
const route = "dlt"
const OTP = db.otp;

// Configuration
const OTP_LENGTH = 4;
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES) || 5;
const MAX_ATTEMPTS = 3;

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP code
 * @returns {string} - Generated OTP code
 */
const generateOTP = (length = OTP_LENGTH) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Send OTP via SMS using SMS India Hub
 * @param {string} phone - Recipient phone number (e.g., 989xxxxxxx or +91989xxxxxxx)
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - API response result
 */
const sendOTPViaSMS = async (phone, otp) => {
  try {
    // Format phone number: ensure it's 10-digit without country code
    let formattedPhone = phone.replace(/^\+?91/, '').replace(/\D/g, '');
    if (formattedPhone.length !== 10) {
      throw new Error('Invalid phone number format');
    }

    const message = otp;

    const params = {
      authorization: AUTHORIZATION,
      route: ROUTE,
      sender_id: SENDER_ID,
      variables_values: message,
      numbers: formattedPhone,
      schedule_time: "",
      flash: FLASH.toString(),
      message: 206794,
    };

    const response = await axios.get(API_BASE_URL, { params });

    const result = response.data;

    if (response.status === 200 && result.return === true) {
      console.log("📱 SMS sent successfully via Fast2SMS:", {
        request_id: result.request_id,
        message: result.message,
        phone: formattedPhone,
      });

      return {
        success: true,
        request_id: result.request_id,
        message: result.message,
      };
    } else {
      throw new Error(result.message ? result.message.join(', ') : 'Failed to send SMS');
    }
  } catch (error) {
    console.error("❌ Error sending SMS via Fast2SMS:", error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Send OTP to a phone number
 * @param {string} phone - Recipient phone number
 * @param {string} type - OTP type (USER_LOGIN, CUSTOMER_LOGIN, REGISTRATION)
 * @returns {Promise<Object>} - Result of OTP sending
 */
const sendOTP = async (phone, type = "USER_LOGIN") => {
  try {
    // Check if there's a recent valid OTP for this phone (within last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const recentOTP = await OTP.findOne({
      where: {
        phone,
        createdAt: { [Op.gte]: twoMinutesAgo },
        verified: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (recentOTP) {
      return {
        success: false,
        message: "Please wait 2 minutes before requesting a new OTP",
        waitTime: 120 - Math.floor((Date.now() - new Date(recentOTP.createdAt).getTime()) / 1000),
      };
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save OTP to database
    const otpRecord = await OTP.create({
      phone,
      otp: otpCode,
      expiresAt,
      type,
      verified: false,
      attempts: 0,
    });

    console.log(`🔐 Generated OTP for ${phone}: ${otpCode} (ID: ${otpRecord.id})`);

    // Send OTP directly via SMS India Hub
    console.log("📱 Sending OTP directly via SMS India Hub...");
    await sendOTPViaSMS(phone, otpCode);

    return {
      success: true,
      message: "OTP sent successfully",
      expiresAt,
      otpId: otpRecord.id,
    };
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

/**
 * Check if OTP is valid (without marking as verified)
 * Used by the /api/otp/verify endpoint to just validate OTP
 * @param {string} phone - Phone number
 * @param {string} otpCode - OTP code to check
 * @param {string} type - OTP type
 * @returns {Promise<Object>} - Validation result
 */
const checkOTP = async (phone, otpCode, type = "USER_LOGIN") => {
  try {
    // Bypass validation for testing OTP
    if (otpCode === "0809") {
      console.log(`🔓 Bypass OTP validated for ${phone}`);
      return {
        success: true,
        message: "OTP is valid",
        bypass: true,
      };
    }

    // Find the most recent unverified OTP for this phone
    const otpRecord = await OTP.findOne({
      where: {
        phone,
        type,
        verified: false,
        expiresAt: { [Op.gt]: new Date() }, // Not expired
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "Invalid or expired OTP",
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // Check OTP without incrementing attempts
    if (otpRecord.otp !== otpCode) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    console.log(`✅ OTP is valid for ${phone}`);

    return {
      success: true,
      message: "OTP is valid",
      otpId: otpRecord.id,
    };
  } catch (error) {
    console.error("❌ Error checking OTP:", error);
    throw new Error(`Failed to check OTP: ${error.message}`);
  }
};

/**
 * Verify OTP code and mark as verified (used for login)
 * @param {string} phone - Phone number
 * @param {string} otpCode - OTP code to verify
 * @param {string} type - OTP type
 * @returns {Promise<Object>} - Verification result
 */
const verifyOTP = async (phone, otpCode, type = "USER_LOGIN") => {
  try {
    // Bypass validation for testing OTP
    if (otpCode === "0809") {
      console.log(`🔓 Bypass OTP verified for ${phone}`);
      return {
        success: true,
        message: "OTP verified successfully",
        bypass: true,
      };
    }

    // Find the most recent unverified OTP for this phone
    const otpRecord = await OTP.findOne({
      where: {
        phone,
        type,
        verified: false,
        expiresAt: { [Op.gt]: new Date() }, // Not expired
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return {
        success: false,
        message: "Invalid or expired OTP",
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // Increment attempts
    await otpRecord.update({
      attempts: otpRecord.attempts + 1,
    });

    // Verify OTP
    if (otpRecord.otp !== otpCode) {
      const remainingAttempts = MAX_ATTEMPTS - otpRecord.attempts;
      return {
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
        remainingAttempts,
      };
    }

    // Mark OTP as verified
    await otpRecord.update({
      verified: true,
    });

    console.log(`✅ OTP verified and marked as used for ${phone}`);

    return {
      success: true,
      message: "OTP verified successfully",
      otpId: otpRecord.id,
    };
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    throw new Error(`Failed to verify OTP: ${error.message}`);
  }
};

/**
 * Clean up expired OTPs (can be called periodically)
 * @returns {Promise<number>} - Number of deleted records
 */
const cleanupExpiredOTPs = async () => {
  try {
    const deleted = await OTP.destroy({
      where: {
        [Op.or]: [
          { expiresAt: { [Op.lt]: new Date() } },
          { verified: true, createdAt: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        ],
      },
    });

    console.log(`🧹 Cleaned up ${deleted} expired OTP records`);
    return deleted;
  } catch (error) {
    console.error("❌ Error cleaning up OTPs:", error);
    throw error;
  }
};

module.exports = {
  sendOTPViaSMS,
  sendOTP,
  checkOTP,
  verifyOTP,
  cleanupExpiredOTPs,
  generateOTP,
};
