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
    restaurantType: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Comma separated values for service types (table,self,both)',
    },
    foodType: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Comma separated values for food types (veg,nonveg,both)',
    },
  },
   {
    tableName: 'user'
  });

  return User;
};