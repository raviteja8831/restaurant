module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define(
    "order",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Allow null for table booking orders
        references: {
          model: "user",
          key: "id",
        },
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      total: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tableId: {
        type: Sequelize.INTEGER,
        allowNull: true, // Allow null for non-table orders (delivery, pickup)
        references: {
          model: "restauranttable",
          key: "id",
        },
      },
      /*  paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "UPI", // card, cash, upi, etc.
      }, */
      membercount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
        defaultValue: 'razorpay',
      },
      razorpayOrderId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      razorpayPaymentId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      razorpaySignature: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      commission: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      commissionPercentage: {
        type: Sequelize.FLOAT,
        defaultValue: 2.5,
      },
      commissionStatus: {
        type: Sequelize.ENUM('none', 'pending', 'paid'),
        defaultValue: 'none',
      },
      hasSubscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      paymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      totalPrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
    },
    {
      tableName: "order",
    }
  );
  return Order;
};
