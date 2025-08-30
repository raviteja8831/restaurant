module.exports = (sequelize, Sequelize) => {
  const Announcement = sequelize.define("announcement", {
    message: { type: Sequelize.STRING, allowNull: false },
    restaurantId: { type: Sequelize.INTEGER },
        restaurantId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "restaurant",
            key: "id",
          },
        },
  }, {
    tableName: 'announcement'
  });
    return Announcement;

};
