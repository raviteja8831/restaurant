module.exports = (sequelize, Sequelize) => {
  const AppSettings = sequelize.define("appsettings", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    settingKey: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      field: 'setting_key',
      comment: 'Unique key for the setting (e.g., admin_upi, subscription_amount)'
    },
    settingValue: {
      type: Sequelize.TEXT,
      allowNull: false,
      field: 'setting_value',
      comment: 'Value of the setting'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Description of what this setting is for'
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "appsettings",
  }
  );
  return AppSettings;
};
