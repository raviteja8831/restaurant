module.exports = {
  HOST: "database-2.cjsqyckyc8sg.ap-south-1.rds.amazonaws.com",
  USER: "admin",
  PASSWORD: "oGO1pAtKTehM3rIyWndQ",
  DB: "restaurant_service",
  dialect: "mysql",
  timezone: "+05:30", // sets the timezone to IST
  dialectOptions: {
    useUTC: false,  // tell the MySQL driver not to convert dates to UTC
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};