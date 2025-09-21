module.exports = (sequelize, Sequelize) => {
  const Restaurant = sequelize.define(
    "restaurant",
    {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      /* 
    enableBuffet: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }, */
      enableVeg: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      enableNonveg: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      enableTableService: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      enableSelfService: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      ambianceImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      logoImage: {
        type: Sequelize.STRING,
        allowNull: true,
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
      tableName: "restaurant",
    }
  );
  return Restaurant;
};
