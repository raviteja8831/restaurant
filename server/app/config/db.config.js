module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "1509",
  DB: "res1",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
