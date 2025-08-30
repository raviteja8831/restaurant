module.exports = (sequelize, Sequelize) => {
  const Restaurant = sequelize.define("restaurant", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    address: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    typeId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurantType",
        key: "id",
      },
    },
    ambianceImage: {
      type: Sequelize.STRING,
    },
    logoImage: {
      type: Sequelize.STRING,
    },
  }, {
    tableName: 'restaurant'
  });
  return Restaurant;
};
