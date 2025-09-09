module.exports = (sequelize, Sequelize) => {
  const RestaurantRating = sequelize.define(
    "restaurantRating",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user",
          key: "id",
        },
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
    },
    {
      tableName: "RestaurantRating",
    }
  );

  return RestaurantRating;
};
