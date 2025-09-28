module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    fromUserId: { type: DataTypes.INTEGER, allowNull: false,  references: {
        model: "restaurantuser",
        key: "id",
      }, },
    fromRoleId: { type: DataTypes.INTEGER, allowNull: false ,   references: {
        model: "role",
        key: "id",
      },},
    toUserId: { type: DataTypes.INTEGER, allowNull: false,   references: {
        model: "restaurantuser",
        key: "id",
      }, },
    toRoleId: { type: DataTypes.INTEGER, allowNull: false,   references: {
        model: "role",
        key: "id",
      }, },
    message: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'message',
    timestamps: true
  });
  return Message;
};
