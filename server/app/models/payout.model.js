module.exports = (sequelize, Sequelize) => {
  const Payout = sequelize.define("payout", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Razorpay IDs
    razorpayPayoutId: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Razorpay payout ID'
    },
    razorpayFundAccountId: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Razorpay fund account ID'
    },
    // Related entities
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Related order ID',
      references: {
        model: 'order',
        key: 'id'
      }
    },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      comment: 'Restaurant receiving payout',
      references: {
        model: 'restaurant',
        key: 'id'
      }
    },
    transactionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Related transaction ID'
    },
    // Payout details
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Payout amount in INR'
    },
    currency: {
      type: Sequelize.STRING(3),
      defaultValue: 'INR'
    },
    mode: {
      type: Sequelize.STRING(50),
      defaultValue: 'UPI',
      comment: 'Payment mode: UPI, IMPS, NEFT'
    },
    // Status tracking
    status: {
      type: Sequelize.ENUM('pending', 'processing', 'processed', 'reversed', 'failed'),
      defaultValue: 'pending'
    },
    purpose: {
      type: Sequelize.STRING(100),
      defaultValue: 'payout',
      comment: 'Razorpay payout purpose'
    },
    // Metadata
    referenceId: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Internal reference ID'
    },
    narration: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Payout description'
    },
    failureReason: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason if payout failed'
    },
    // Timestamps
    initiatedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When payout was initiated'
    },
    processedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'When payout was processed'
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "payouts",
  });

  return Payout;
};
