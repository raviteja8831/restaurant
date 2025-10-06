const { verifyManager } = require("../middleware/authMiddleware");

module.exports = app => {
  const manager = require("../controllers/manager.controller.js");
  const router = require("express").Router();

  // Manager dashboard (manager only)
  router.get('/dashboard/:restaurantId', verifyManager, manager.dashboard);

  app.use('/api/manager', router);
};
