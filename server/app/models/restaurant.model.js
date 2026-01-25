module.exports = (sequelize, Sequelize) => {
  const Restaurant = sequelize.define("restaurant", {
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
    latitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
    restaurantType: {
      type: Sequelize.STRING,
      allowNull: true,
    },
   
    enableBuffet: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    }, 
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
      upi:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpayFundAccountId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Razorpay fund account ID for payouts'
      },
      razorpayContactId: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Razorpay contact ID for payouts'
      },
      bankAccountName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Account holder name'
      },
      bankAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Bank account number'
      },
      bankIfscCode: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'IFSC code'
      },
      bankName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Bank name'
      },
      bankAccountType: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Account type: savings/current'
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
