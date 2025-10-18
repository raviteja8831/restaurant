module.exports = (sequelize, Sequelize) => {
  const OrdersProducts = sequelize.define(
    "ordersproduct",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "order",
          key: "id",
        },
      },
      menuitemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "menuitem",
          key: "id",
        },
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'ORDERED',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "ordersproduct",
      timestamps: true,
    }
  );

  return OrdersProducts;
};
