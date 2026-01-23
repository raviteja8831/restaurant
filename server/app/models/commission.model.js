module.exports = (sequelize, Sequelize) => {
  const Commission = sequelize.define("commission", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'order',
        key: 'id'
      }
    },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'restaurant',
        key: 'id'
      }
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false,
      comment: 'Commission amount in INR'
    },
    percentage: {
      type: Sequelize.FLOAT,
      defaultValue: 2.5,
      comment: 'Commission percentage'
    },
    status: {
      type: Sequelize.ENUM('pending', 'paid', 'none'),
      defaultValue: 'pending',
      comment: 'Commission status: pending, paid, none (for subscribed restaurants)'
    },
    hasSubscription: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Whether restaurant had active subscription (affects commission)'
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Reason for commission status (e.g., "Active subscription" for none)'
    },
    paidDate: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when commission was paid'
    },
    paymentMethod: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Method used to pay commission (bank transfer, etc.)'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Additional notes about the commission'
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
    tableName: "commission",
  }
  );
  return Commission;
};
