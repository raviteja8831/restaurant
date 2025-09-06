module.exports = (sequelize, Sequelize) => {
  const UserMenuItem = sequelize.define("user_menuitem", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "restaurantusers", // Ensure this matches your actual table name
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
