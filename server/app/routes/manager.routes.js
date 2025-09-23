module.exports = app => {
  const manager = require("../controllers/manager.controller.js");
  const router = require("express").Router();

  // Manager dashboard (mock)
  router.get('/dashboard/:restaurantId', manager.dashboard);

  app.use('/api/manager', router);
};
