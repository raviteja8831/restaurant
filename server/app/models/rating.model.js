module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('rating', {
    userId: { type: DataTypes.INTEGER },
    restaurantId: { type: DataTypes.INTEGER },
    stars: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.STRING },
  });
  return Rating;
};
