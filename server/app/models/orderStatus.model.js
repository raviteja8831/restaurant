module.exports = (sequelize, Sequelize) => {
  const OrderStatus = sequelize.define(
    "orderstatus",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
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
      tableName: "orderstatus",
      timestamps: true,
    }
  );

  return OrderStatus;
};
