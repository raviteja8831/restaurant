module.exports = (sequelize, Sequelize) => {
  const RestaurantTable = sequelize.define("restaurantTable", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    status: { type: Sequelize.STRING, defaultValue: "free" },
    qrcode: { type: Sequelize.STRING },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurant",
        key: "id",
      },
    },
  }, {
    tableName: 'RestaurantTable'
  });
  return RestaurantTable;
};
