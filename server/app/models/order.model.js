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
      total: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      /*  paymentMethod: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "UPI", // card, cash, upi, etc.
      }, */
      membercount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // defaultValue: "UPI", // card, cash, upi, etc.
      },
    },
    {
      tableName: "Order",
    }
  );
  return Order;
};
