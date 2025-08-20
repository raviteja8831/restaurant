module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  // username removed
    phone: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
  // email removed
  // password removed
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles", // Name of the roles table
        key: "id",      // Key in the roles table to reference
      },
    },
  });

  return User;
};