module.exports = (sequelize, Sequelize) => {
  const OTP = sequelize.define(
    "otp",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      otp: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.ENUM("USER_LOGIN", "CUSTOMER_LOGIN", "REGISTRATION"),
        allowNull: false,
        defaultValue: "USER_LOGIN",
      },
    },
    {
      tableName: "otp",
      indexes: [
        {
          fields: ["phone", "verified", "expiresAt"],
        },
      ],
    }
  );

  return OTP;
};
