module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('message', {
    fromUserId: { type: DataTypes.INTEGER, allowNull: false },
    fromRoleId: { type: DataTypes.INTEGER, allowNull: false },
    toUserId: { type: DataTypes.INTEGER, allowNull: false },
    toRoleId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'message',
    timestamps: true
  });
  return Message;
};
