module.exports = (sequelize, Sequelize) => {
  const RestaurantType = sequelize.define("restauranttypes", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return RestaurantType;
};
