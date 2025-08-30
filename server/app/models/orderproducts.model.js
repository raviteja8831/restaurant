module.exports = (sequelize, Sequelize) => {
  const OrdersProducts = sequelize.define("orderproduct", {
    quantity: {
      type: Sequelize.INTEGER
    },
    orderId: {
      type: Sequelize.INTEGER,
      references: {
        model: "order",
        key: "id",
      },
    },
    productId: {
      type: Sequelize.INTEGER,
      references: {
        model: "menuitem",
        key: "id",
      },
    }
  }, {
    tableName: 'OrdersProduct'
  });
  
  return OrdersProducts;
};
