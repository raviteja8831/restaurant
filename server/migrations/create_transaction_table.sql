-- Create Transaction Table
-- This table stores all payment transactions

CREATE TABLE IF NOT EXISTS transaction (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  restaurantId INT NOT NULL,
  amount FLOAT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  paymentMethod VARCHAR(50) DEFAULT 'razorpay',
  razorpayOrderId VARCHAR(100),
  razorpayPaymentId VARCHAR(100),
  razorpaySignature VARCHAR(255),
  commission FLOAT DEFAULT 0,
  commissionPercentage FLOAT DEFAULT 2.5,
  commissionStatus ENUM('none', 'pending', 'paid') DEFAULT 'none',
  hasSubscription BOOLEAN DEFAULT FALSE,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurant(id),
  FOREIGN KEY (orderId) REFERENCES `order`(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_transaction_razorpay_order ON transaction(razorpayOrderId);
CREATE INDEX idx_transaction_razorpay_payment ON transaction(razorpayPaymentId);
CREATE INDEX idx_transaction_restaurant ON transaction(restaurantId);
CREATE INDEX idx_transaction_status ON transaction(status);
CREATE INDEX idx_transaction_commission_status ON transaction(commissionStatus);
CREATE INDEX idx_transaction_date ON transaction(date);
CREATE INDEX idx_transaction_order ON transaction(orderId);
