module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('menuitem', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    type: { type: DataTypes.STRING }, // veg/non-veg
    menuId: { type: DataTypes.INTEGER },
  });
  return MenuItem;
};
