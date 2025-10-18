module.exports = (sequelize, Sequelize) => {
  const MenuItem = sequelize.define("menuitem", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.FLOAT, allowNull: false },
    type: { type: Sequelize.STRING }, // veg/non-veg
    status: { type: Sequelize.BOOLEAN }, // veg/non-veg

    menuId: {
      type: Sequelize.INTEGER,
      references: {
        model: "menu",
        key: "id",
      },
    },
  }, {
    tableName: 'menuitem'
  });
  return MenuItem;
};
