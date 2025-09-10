module.exports = (sequelize, Sequelize) => {
  const BuffetOrder = sequelize.define(
    "BuffetOrder",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "user",
          key: "id",
        },
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "restaurant",
          key: "id",
        },
      },
      persons: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      tableName: "buffetorders",
      timestamps: true,
    }
  );
  return BuffetOrder;
};
