module.exports = (sequelize, Sequelize) => {
  const Restaurant = sequelize.define(
    "restaurant",
    {
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
      restaurantType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Comma separated values for service types (table,self,both)",
      },
      foodType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Comma separated values for food types (veg,nonveg,both)",
      },
      enableBuffet: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      ambianceImage: {
        type: Sequelize.STRING,
      },
      logoImage: {
        type: Sequelize.STRING,
      },
    },
    {
      tableName: "restaurant",
    }
  );

  Restaurant.associate = function (models) {
    Restaurant.hasMany(models.userFavorite, {
      foreignKey: "restaurantId",
      as: "favoritedBy",
    });
  };

  return Restaurant;
};
