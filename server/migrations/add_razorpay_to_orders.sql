-- Add Razorpay Payment Fields to Orders Table
-- This migration adds Razorpay payment columns directly to the orders table

ALTER TABLE `order`
ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'razorpay' AFTER status,
ADD COLUMN razorpayOrderId VARCHAR(100) AFTER paymentMethod,
ADD COLUMN razorpayPaymentId VARCHAR(100) AFTER razorpayOrderId,
ADD COLUMN razorpaySignature VARCHAR(255) AFTER razorpayPaymentId,
ADD COLUMN commission FLOAT DEFAULT 0 AFTER razorpaySignature,
ADD COLUMN commissionPercentage FLOAT DEFAULT 2.5 AFTER commission,
ADD COLUMN commissionStatus ENUM('none', 'pending', 'paid') DEFAULT 'none' AFTER commissionPercentage,
ADD COLUMN hasSubscription BOOLEAN DEFAULT FALSE AFTER commissionStatus,
ADD COLUMN paymentDate DATETIME AFTER hasSubscription;

-- Create indexes for better query performance
CREATE INDEX idx_order_razorpay_order ON `order`(razorpayOrderId);
CREATE INDEX idx_order_razorpay_payment ON `order`(razorpayPaymentId);
CREATE INDEX idx_order_commission_status ON `order`(commissionStatus);
CREATE INDEX idx_order_payment_method ON `order`(paymentMethod);

-- Optional: Add endDate to subscription table if not exists
ALTER TABLE subscription
ADD COLUMN endDate DATE AFTER startDate;

-- Create commission table to track commission separately
CREATE TABLE IF NOT EXISTS commission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
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
  FOREIGN KEY (orderId) REFERENCES `order`(id),
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id)
);

-- Create indexes on commission table
CREATE INDEX idx_commission_status ON commission(status);
CREATE INDEX idx_commission_restaurant ON commission(restaurantId);
CREATE INDEX idx_commission_order ON commission(orderId);
CREATE INDEX idx_commission_date ON commission(createdAt);
