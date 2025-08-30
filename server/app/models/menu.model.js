module.exports = (sequelize, Sequelize) => {
  const Menu = sequelize.define("menu", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    restaurantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurant",
        key: "id",
      },
    },
  }, {
    tableName: 'menu'
  });
  return Menu;
};
