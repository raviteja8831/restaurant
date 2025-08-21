module.exports = (sequelize, Sequelize) => {
  const QRCode = sequelize.define("qrcode", {
    value: { type: Sequelize.STRING, allowNull: false },
    restTableId: {
      type: Sequelize.INTEGER,
      references: {
        model: "restaurantTable",
        key: "id",
      },
    },
  });
  return QRCode;
};
