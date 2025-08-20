module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define('announcement', {
    message: { type: DataTypes.STRING, allowNull: false },
    restaurantId: { type: DataTypes.INTEGER },
  });
  return Announcement;
};
