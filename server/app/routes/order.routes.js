const { verifyToken, verifyCustomer, verifyRestaurantUser, verifyManager } = require("../middleware/authMiddleware");

module.exports = (app) => {
  const orders = require("../controllers/order.controller.js");

  const router = require("express").Router();

  // Create a new order (customers only)
  router.post("/create", orders.createOrder);

  // Get pending orders for a restaurant selected (restaurant users only)
  router.get("/pending/:restaurantId/:userId", orders.getPendingOrders);
  router.get("/selected/items/:orderId", orders.getSelectedOrderItems);

  // Get PAID orders for a restaurant (manager only)
  router.get("/paid/:restaurantId", orders.getPaidOrders);

  // Get user's pending payment orders (PLACED but not PAID) - customer access
  router.get("/user-pending-payments/:restaurantId/:userId", orders.getUserPendingPayments);

  // Delete an order and its items (manager only)
  router.delete("/delete/:orderId", orders.deleteOrder);

  // Update order status and items (restaurant users only)
  router.put("/:orderId", orders.updateOrderStatus);
  router.post("/orderproduct/:orderId", orders.updateOrderProductStatusList);
  router.post("/delete/items/", orders.deleteOrderItems);

  app.use("/api/orders", router);
};
