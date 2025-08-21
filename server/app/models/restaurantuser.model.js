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
    email: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },

    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles", // Name of the roles table
        key: "id",      // Key in the roles table to reference
      },
    },
  });

  return RestaurantUser;
};
