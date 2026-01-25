module.exports = (sequelize, Sequelize) => {
  const TableBooking = sequelize.define(
    "tableBooking",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      tableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restauranttable",
          key: "id",
        },
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      starttime: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('booked', 'payment_completed', 'payment_pending'),
        allowNull: false,
        defaultValue: 'booked',
      },
      razorpayOrderId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      razorpayPaymentId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "tablebookings",
    }
  );

  return TableBooking;
};
