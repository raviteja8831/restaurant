-- Add Razorpay fund account tracking to restaurant table
ALTER TABLE restaurant
ADD COLUMN razorpayFundAccountId VARCHAR(255) NULL COMMENT 'Razorpay fund account ID for payouts',
ADD COLUMN razorpayContactId VARCHAR(255) NULL COMMENT 'Razorpay contact ID for payouts';

-- Create index for faster lookups
CREATE INDEX idx_restaurant_fund_account ON restaurant(razorpayFundAccountId);

-- Create payouts table for tracking all money transfers
CREATE TABLE IF NOT EXISTS payouts (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Razorpay IDs
  razorpayPayoutId VARCHAR(255) NULL COMMENT 'Razorpay payout ID',
  razorpayFundAccountId VARCHAR(255) NOT NULL COMMENT 'Razorpay fund account ID',

  -- Related entities
  orderId INT NULL COMMENT 'Related order ID',
  restaurantId INT NOT NULL COMMENT 'Restaurant receiving payout',
  transactionId INT NULL COMMENT 'Related transaction ID',

  -- Payout details
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Payout amount in INR',
  currency VARCHAR(3) DEFAULT 'INR',
  mode VARCHAR(50) DEFAULT 'UPI' COMMENT 'Payment mode: UPI, IMPS, NEFT',

  -- Status tracking
  status ENUM('pending', 'processing', 'processed', 'reversed', 'failed') DEFAULT 'pending',
  purpose VARCHAR(100) DEFAULT 'payout' COMMENT 'Razorpay payout purpose',

  -- Metadata
  referenceId VARCHAR(255) NULL COMMENT 'Internal reference ID',
  narration TEXT NULL COMMENT 'Payout description',
  failureReason TEXT NULL COMMENT 'Reason if payout failed',

  -- Timestamps
  initiatedAt DATETIME NULL COMMENT 'When payout was initiated',
  processedAt DATETIME NULL COMMENT 'When payout was processed',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_payout_razorpay_id (razorpayPayoutId),
  INDEX idx_payout_order (orderId),
  INDEX idx_payout_restaurant (restaurantId),
  INDEX idx_payout_status (status),
  INDEX idx_payout_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tracks all Razorpay payouts to restaurants';

-- Add payout tracking to commission table
ALTER TABLE commission
ADD COLUMN payoutId INT NULL COMMENT 'Related payout ID if commission was transferred',
ADD COLUMN payoutStatus ENUM('not_applicable', 'pending', 'completed', 'failed') DEFAULT 'not_applicable' COMMENT 'Commission payout status',
ADD FOREIGN KEY (payoutId) REFERENCES payouts(id) ON DELETE SET NULL;
