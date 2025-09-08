module.exports = (sequelize, Sequelize) => {
  const Order = sequelize.define("order", {
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
    tableId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Restauranttable',
        key: 'id',
      },
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'Order'
  });
  return Order;
};
