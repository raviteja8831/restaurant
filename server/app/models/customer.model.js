module.exports = (sequelize, Sequelize) => {
  const Customer = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3, // Assuming 3 is the role_id for customers
      },
    },
    {
      tableName: "user",
    }
  );

  return Customer;
};
