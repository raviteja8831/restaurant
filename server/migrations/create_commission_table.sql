-- Create Commission Table
-- This table tracks commissions for Razorpay payments

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
