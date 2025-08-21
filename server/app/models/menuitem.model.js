module.exports = (sequelize, Sequelize) => {
  const MenuItem = sequelize.define("menuitem", {
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.FLOAT, allowNull: false },
    type: { type: Sequelize.STRING }, // veg/non-veg
    menuId: {
      type: Sequelize.INTEGER,
      references: {
        model: "menu",
        key: "id",
      },
    },
  });
  return MenuItem;
};
