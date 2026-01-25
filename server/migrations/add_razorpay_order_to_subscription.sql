-- Add razorpayOrderId column to subscription table for Razorpay integration
ALTER TABLE subscription
ADD COLUMN razorpayOrderId VARCHAR(255) NULL
COMMENT 'Razorpay order ID for tracking payment';

-- Add index for faster lookups
CREATE INDEX idx_subscription_razorpay_order ON subscription(razorpayOrderId);
