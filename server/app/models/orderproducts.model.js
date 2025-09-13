module.exports = (sequelize, Sequelize) => {
  const OrdersProducts = sequelize.define(
    "orderproduct",
    {
      quantity: {
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "order",
          key: "id",
        },
      },
      menuItemId: {
        type: Sequelize.INTEGER,
        references: {
          model: "menuitem",
          key: "id",
        },
      },
      comments: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "OrdersProduct",
    }
  );

  return OrdersProducts;
};
