const { verifyToken, verifyCustomer, verifyRestaurantUser, verifyManager } = require("../middleware/authMiddleware");

module.exports = (app) => {
  const orders = require("../controllers/order.controller.js");

  const router = require("express").Router();

  // Create a new order (customers only)
  router.post("/create", verifyCustomer, orders.createOrder);

  // Get pending orders for a restaurant selected (restaurant users only)
  router.get("/pending/:restaurantId/:userId", verifyRestaurantUser, orders.getPendingOrders);
  router.get("/selected/items/:orderId", verifyRestaurantUser, orders.getSelectedOrderItems);

  // Delete an order and its items (manager only)
  router.delete("/delete/:orderId", verifyManager, orders.deleteOrder);

  // Update order status and items (restaurant users only)
  router.put("/:orderId", verifyRestaurantUser, orders.updateOrderStatus);
  router.post("/orderproduct/:orderId", verifyRestaurantUser, orders.updateOrderProductStatusList);
  router.post("/delete/items/", verifyRestaurantUser, orders.deleteOrderItems);

  app.use("/api/orders", router);
};
