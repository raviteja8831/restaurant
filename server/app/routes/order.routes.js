const { verifyToken } = require("../controllers/user.controller.js");

module.exports = (app) => {
  const orders = require("../controllers/order.controller.js");

  const router = require("express").Router();

  // Create a new order
  router.post("/create", orders.createOrder);

  // Get pending orders for a restaurant selected
  router.get("/pending/:restaurantId/:userId", orders.getPendingOrders);
  router.get("/selected/items/:orderId", orders.getSelectedOrderItems);

  app.use("/api/orders", router);
};
