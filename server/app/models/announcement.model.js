module.exports = (sequelize, Sequelize) => {
  const Announcement = sequelize.define("announcement", {
    message: { type: Sequelize.STRING, allowNull: false },
    restaurantId: { type: Sequelize.INTEGER },
  });
  return Announcement;
};
