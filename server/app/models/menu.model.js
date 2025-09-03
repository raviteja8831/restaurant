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
    status: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    icon: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "",
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
