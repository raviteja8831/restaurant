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
      buffetId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "buffet",
          key: "id",
        },
      },
      persons: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('booked', 'payment_completed'),
        allowNull: false,
        defaultValue: 'booked',
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
