const { verifyToken, verifyManager } = require("../middleware/authMiddleware");

module.exports = app => {
  const subscription = require('../controllers/subscription.controller');
  var router = require('express').Router();

  // Create new subscription (manager only)
  router.post('/', verifyManager, subscription.create);

  // Get all subscriptions for a restaurant (manager only)
  router.get('/restaurant/:restaurantId', verifyManager, subscription.findAllByRestaurant);

  // Get latest subscription for a restaurant (manager only)
  router.get('/restaurant/:restaurantId/latest', verifyManager, subscription.getLatest);

  // Check subscription status (active/expired) - public access for customers
  router.get('/restaurant/:restaurantId/status', subscription.checkStatus);

  // Update subscription payment status (manager only)
  router.put('/:id/payment', verifyManager, subscription.updatePaymentStatus);

  // Delete subscription (manager only)
  router.delete('/:id', verifyManager, subscription.delete);

  // Get admin UPI ID - public access
  router.get('/admin/upi', subscription.getAdminUpi);

  app.use('/api/subscriptions', router);
};
