module.exports = (sequelize, Sequelize) => {
  const OrdersProducts = sequelize.define("orderproducts", {
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
  });

  return OrdersProducts;
};
