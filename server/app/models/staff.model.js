module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('staff', {
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
  });
  return Staff;
};
