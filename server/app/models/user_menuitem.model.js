module.exports = (sequelize, Sequelize) => {
  const UserMenuItem = sequelize.define("user_menuitem", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurantUser", // Correct table name for association
        key: "id",
      },
    },
    menuitemId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "menuitem",
        key: "id",
      },
    },
  }, {
    tableName: 'user_menuitem',
    timestamps: false
  });
  return UserMenuItem;
};
