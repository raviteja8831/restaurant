const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
require("dotenv").config();

// Configure AWS SQS Client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Send OTP message to SQS queue
 * @param {Object} messageData - The OTP message data
 * @param {string} messageData.phone - Recipient phone number
 * @param {string} messageData.otp - OTP code
 * @param {string} messageData.type - Type of OTP (USER_LOGIN, CUSTOMER_LOGIN, REGISTRATION)
 * @returns {Promise<Object>} - SQS message result
 */
const sendOTPToQueue = async (messageData) => {
  try {
    const params = {
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify({
        phone: messageData.phone,
        otp: messageData.otp,
        type: messageData.type,
        timestamp: new Date().toISOString(),
      }),
      MessageAttributes: {
        MessageType: {
          DataType: "String",
          StringValue: "OTP",
        },
        Phone: {
          DataType: "String",
          StringValue: messageData.phone,
        },
      },
    };

    const command = new SendMessageCommand(params);
    const result = await sqsClient.send(command);

    console.log("📤 OTP message sent to SQS queue:", {
      messageId: result.MessageId,
      phone: messageData.phone,
      type: messageData.type,
    });

    return {
      success: true,
      messageId: result.MessageId,
      message: "OTP queued successfully",
    };
  } catch (error) {
    console.error("❌ Error sending OTP to SQS:", error);
    throw new Error(`Failed to queue OTP: ${error.message}`);
  }
};

/**
 * Process OTP message from SQS (for consumer worker)
 * This function can be used by a separate worker process to consume messages
 * @param {Object} message - SQS message
 * @returns {Promise<void>}
 */
const processOTPMessage = async (message) => {
  try {
    const messageBody = JSON.parse(message.Body);
    console.log("📥 Processing OTP message from queue:", messageBody);

    // Here you can implement the actual SMS sending logic
    // For now, we'll just log it
    // In production, you would call SNS or another SMS service here

    return {
      success: true,
      message: "OTP processed successfully",
    };
  } catch (error) {
    console.error("❌ Error processing OTP message:", error);
    throw error;
  }
};

module.exports = {
  sendOTPToQueue,
  processOTPMessage,
};
