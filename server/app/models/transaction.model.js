module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('transaction', {
    orderId: { type: DataTypes.INTEGER },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'transaction'
  });
  return Transaction;
};
