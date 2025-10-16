const { verifyManager } = require("../middleware/authMiddleware");

module.exports = app => {
  const manager = require("../controllers/manager.controller.js");
  const router = require("express").Router();

  // Manager dashboard (manager only)
  router.get('/dashboard/:restaurantId', verifyManager, manager.dashboard);

  // Get paid orders that need to be cleared
  router.get('/orders/paid/:restaurantId', verifyManager, manager.getPaidOrders);

  // Clear/complete an order after payment verification
  router.post('/orders/clear/:orderId', verifyManager, manager.clearOrder);

  // Get chef login/logout activity report
  router.get('/chef-activity/:restaurantId', verifyManager, manager.getChefActivityReport);

  app.use('/api/manager', router);
};
