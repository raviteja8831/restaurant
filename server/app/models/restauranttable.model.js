module.exports = (sequelize, Sequelize) => {
  const RestaurantTable = sequelize.define("restauranttable", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.STRING, defaultValue: "free" },
  qrcode: { type: Sequelize.TEXT },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurant",
        key: "id",
      },
    },
  }, {
    tableName: 'Restauranttable'
  });
  return RestaurantTable;
};
