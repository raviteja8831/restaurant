module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('menu', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
  });
  return Menu;
};
