module.exports = (sequelize, DataTypes) => {
  const Table = sequelize.define('table', {
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'free' },
    qrcode: { type: DataTypes.STRING },
  });
  return Table;
};
