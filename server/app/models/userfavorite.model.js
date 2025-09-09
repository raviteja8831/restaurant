module.exports = (sequelize, Sequelize) => {
  const UserFavorite = sequelize.define(
    "userFavorite",
    {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "user_favorites",
      indexes: [
        {
          fields: ["restaurantId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["restaurantId", "userId"],
        },
      ],
    }
  );

  UserFavorite.associate = function (models) {
    UserFavorite.belongsTo(models.restaurant, {
      foreignKey: "restaurantId",
      as: "ratedRestaurant",
    });
  };

  UserFavorite.associate = (models) => {
    UserFavorite.belongsTo(models.restaurant, {
      foreignKey: "restaurantId",
      as: "ratedRestaurant",
    });
  };

  return UserFavorite;
};
