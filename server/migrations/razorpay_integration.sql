-- Razorpay Integration Database Migrations
-- Run this script to add Razorpay payment fields to your database

-- ============================================
-- 1. EXTEND TRANSACTION TABLE
-- ============================================
ALTER TABLE transaction 
ADD COLUMN restaurantId INT AFTER orderId,
ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'razorpay' AFTER status,
ADD COLUMN razorpayOrderId VARCHAR(100) AFTER paymentMethod,
ADD COLUMN razorpayPaymentId VARCHAR(100) AFTER razorpayOrderId,
ADD COLUMN razorpaySignature VARCHAR(255) AFTER razorpayPaymentId,
ADD COLUMN commission FLOAT DEFAULT 0 AFTER razorpaySignature,
ADD COLUMN commissionPercentage FLOAT DEFAULT 2.5 AFTER commission,
ADD COLUMN commissionStatus ENUM('none', 'pending', 'paid') DEFAULT 'none' AFTER commissionPercentage,
ADD COLUMN hasSubscription BOOLEAN DEFAULT FALSE AFTER commissionStatus;

-- Create indexes for better query performance
CREATE INDEX idx_transaction_razorpay_order ON transaction(razorpayOrderId);
CREATE INDEX idx_transaction_razorpay_payment ON transaction(razorpayPaymentId);
CREATE INDEX idx_transaction_restaurant ON transaction(restaurantId);
CREATE INDEX idx_transaction_status ON transaction(status);
CREATE INDEX idx_transaction_commission_status ON transaction(commissionStatus);
CREATE INDEX idx_transaction_date ON transaction(date);

-- ============================================
-- 2. CREATE COMMISSION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS commission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transactionId INT NOT NULL,
  restaurantId INT NOT NULL,
  orderId INT,
  amount FLOAT NOT NULL,
  percentage FLOAT DEFAULT 2.5,
  status ENUM('pending', 'paid', 'none') DEFAULT 'pending',
  hasSubscription BOOLEAN DEFAULT FALSE,
  reason VARCHAR(255),
  paidDate DATETIME,
  paymentMethod VARCHAR(100),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionId) REFERENCES transaction(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id),
  FOREIGN KEY (orderId) REFERENCES `order`(id)
);

-- Create indexes on commission table
CREATE INDEX idx_commission_status ON commission(status);
CREATE INDEX idx_commission_restaurant ON commission(restaurantId);
CREATE INDEX idx_commission_transaction ON commission(transactionId);
CREATE INDEX idx_commission_date ON commission(createdAt);

-- ============================================
-- 3. VERIFY SUBSCRIPTION TABLE
-- ============================================
-- Ensure subscription table has the required fields for commission logic
ALTER TABLE subscription 
ADD COLUMN IF NOT EXISTS endDate DATE AFTER startDate;

-- ============================================
-- 4. DATA MIGRATION
-- ============================================
-- Set restaurantId for existing transactions (if null)
-- Update this based on your order structure
UPDATE transaction t
SET t.restaurantId = (
  SELECT o.restaurantId 
  FROM `order` o 
  WHERE o.id = t.orderId
)
WHERE t.restaurantId IS NULL AND t.orderId IS NOT NULL;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================
-- Run these to verify the schema is correct

-- Verify transaction table columns
-- SELECT COLUMN_NAME, DATA_TYPE, NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'transaction' AND TABLE_SCHEMA = 'menutha_db'
-- ORDER BY ORDINAL_POSITION;

-- Verify commission table exists
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
-- WHERE TABLE_NAME = 'commission' AND TABLE_SCHEMA = 'menutha_db';

-- ============================================
-- 6. SAMPLE DATA FOR TESTING (Optional)
-- ============================================
-- Uncomment to add test data

-- INSERT INTO transaction (
--   orderId, 
--   restaurantId, 
--   amount, 
--   status, 
--   paymentMethod, 
--   razorpayOrderId, 
--   commission, 
--   commissionStatus, 
--   hasSubscription, 
--   date
-- ) VALUES (
--   1, 
--   1, 
--   500.00, 
--   'completed', 
--   'razorpay',
--   'order_test_123',
--   12.50,
--   'pending',
--   0,
--   NOW()
-- );

-- ============================================
-- 7. ROLLBACK SCRIPT (If needed)
-- ============================================
-- To rollback these changes, run:
-- ALTER TABLE transaction DROP COLUMN IF EXISTS restaurantId;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS paymentMethod;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS razorpayOrderId;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS razorpayPaymentId;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS razorpaySignature;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS commission;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS commissionPercentage;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS commissionStatus;
-- ALTER TABLE transaction DROP COLUMN IF EXISTS hasSubscription;
-- DROP TABLE IF EXISTS commission;

-- ============================================
-- END OF MIGRATION
-- ============================================
