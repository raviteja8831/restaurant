module.exports = (sequelize, Sequelize) => {
  const RestaurantUser = sequelize.define("restaurantUser", {
 id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    phone: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    firstname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastname: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
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
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "role", // Name of the roles table
        key: "id",      // Key in the roles table to reference
      },
    }
  }, {
    tableName: 'restaurantUser'
  });
  return RestaurantUser;
};
