const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
require("dotenv").config();

// Configure AWS SNS Client
const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Send OTP via SMS using AWS SNS
 * @param {string} phone - Recipient phone number (must include country code, e.g., +91)
 * @param {string} otp - OTP code to send
 * @returns {Promise<Object>} - SNS publish result
 */
const sendOTPViaSMS = async (phone, otp) => {
  try {
    // Ensure phone number has country code
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    const message = `Your OTP is: ${otp}. Valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this with anyone.`;

    const params = {
      Message: message,
      PhoneNumber: formattedPhone,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: process.env.AWS_SNS_SENDER_ID || "MENUTHA",
        },
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional", // Use 'Promotional' for marketing messages
        },
      },
    };

    const command = new PublishCommand(params);
    const result = await snsClient.send(command);

    console.log("📱 SMS sent successfully via SNS:", {
      messageId: result.MessageId,
      phone: formattedPhone,
    });

    return {
      success: true,
      messageId: result.MessageId,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("❌ Error sending SMS via SNS:", error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

module.exports = {
  sendOTPViaSMS,
};
