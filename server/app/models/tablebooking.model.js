module.exports = (sequelize, Sequelize) => {
  const TableBooking = sequelize.define(
    "tableBooking",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      restaurantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restaurants",
          key: "id",
        },
      },
      tableId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "restauranttables",
          key: "id",
        },
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      starttime: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "tablebookings",
    }
  );

  return TableBooking;
};
