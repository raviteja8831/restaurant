module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transaction', {
    orderId: { 
      type: DataTypes.INTEGER,
      references: {
        model: 'order',
        key: 'id'
      }
    },
    restaurantId: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'id'
      }
    },
    amount: { 
      type: DataTypes.FLOAT, 
      allowNull: false 
    },
    status: { 
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      defaultValue: 'razorpay',
      comment: 'Payment method: razorpay, upi, etc.'
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Razorpay order ID'
    },
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Razorpay payment ID after successful payment'
    },
    razorpaySignature: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Razorpay signature for webhook verification'
    },
    commission: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Commission amount (2.5% of transaction for app provider)'
    },
    commissionPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 2.5,
      comment: 'Commission percentage'
    },
    commissionStatus: {
      type: DataTypes.ENUM('none', 'pending', 'paid'),
      defaultValue: 'none',
      comment: 'Commission status: none (if subscription), pending, paid'
    },
    hasSubscription: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether restaurant has active subscription (affects commission)'
    },
    date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: 'transaction'
  });
  return Transaction;
};
