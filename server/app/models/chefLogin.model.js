module.exports = (sequelize, Sequelize) => {
  const ChefLogin = sequelize.define(
    "cheflogin",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      chefId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restaurantuser",
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
      loginTime: {
        type: Sequelize.STRING, // Using STRING to store formatted date
        allowNull: true,
      },
      logOutTime: {
        type: Sequelize.STRING, // Using STRING to store formatted date
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "cheflogin",
    }
  );

  return ChefLogin;
};
