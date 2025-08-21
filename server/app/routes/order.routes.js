const { verifyToken } = require("../controllers/user.controller.js");

module.exports = (app) => {
  const orders = require("../controllers/order.controller.js");

  const router = require("express").Router();


    app.use('/api/orders', router);

};