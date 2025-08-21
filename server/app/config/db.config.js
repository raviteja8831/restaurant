module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "Sid@8387",
  DB: "restaurant_service",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
