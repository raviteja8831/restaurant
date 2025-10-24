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

  // Update subscription payment status (manager only)
  router.put('/:id/payment', verifyManager, subscription.updatePaymentStatus);

  // Delete subscription (manager only)
  router.delete('/:id', verifyManager, subscription.delete);

  // Get admin UPI ID (any authenticated user)
  router.get('/admin/upi', verifyToken, subscription.getAdminUpi);

  app.use('/api/subscriptions', router);
};
