module.exports = (sequelize, Sequelize) => {
  const RestaurantType = sequelize.define("restauranttype", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    }, {
      tableName: 'restauranttype'
    });
  return RestaurantType;
};
