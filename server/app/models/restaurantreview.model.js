module.exports = (sequelize, Sequelize) => {
  const RestaurantReview = sequelize.define(
    "restaurantReview",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      review: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "orders",
          key: "id",
        },
      },
    },
    {
      tableName: "restaurantReview",
    }
  );

  RestaurantReview.associate = function (models) {
    RestaurantReview.belongsTo(models.restaurant, {
      foreignKey: "restaurantId",
      as: "restaurant",
    });
    RestaurantReview.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return RestaurantReview;
};
