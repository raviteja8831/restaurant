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
      allowNull: true,
    },
  // email removed
  // password removed
    role_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "role", // Name of the roles table
        key: "id",      // Key in the roles table to reference
      },
    },
    profileImage: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
   {
    tableName: 'user'
  });

  return User;
};