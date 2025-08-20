module.exports = (sequelize, DataTypes) => {
  const QRCode = sequelize.define('qrcode', {
    value: { type: DataTypes.STRING, allowNull: false },
    tableId: { type: DataTypes.INTEGER },
  });
  return QRCode;
};
