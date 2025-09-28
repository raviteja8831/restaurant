module.exports = (sequelize, Sequelize) => {
  const Buffet = sequelize.define("buffet", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurant",
        key: "id",
      },
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    menu: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Paid',
    },
    price: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  } ,{
    tableName: 'buffet'
  });
  return Buffet;
};
