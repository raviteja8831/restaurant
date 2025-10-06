const { verifyToken, verifyCustomer, verifyManager } = require("../middleware/authMiddleware");

module.exports = (app) => {
  const router = require("express").Router();
  const customers = require("../controllers/customer.controller.js");

  // Create a new Customer (registration - no auth required)
  router.post("/", customers.create);

  // Customer login (no auth required)
  router.post("/login/", customers.findByPhone);

  // Retrieve all Customers (manager only)
  router.get("/", verifyManager, customers.findAll);

  // Retrieve a single Customer with id (customer or manager)
  router.get("/:id", verifyToken, customers.findOne);

  // Update a Customer with id (customer can update own profile, manager can update any)
  router.put("/:id", verifyToken, customers.update);

  // Delete a Customer with id (manager only)
  router.delete("/:id", verifyManager, customers.delete);

  // Get customer profile with orders and favorites (customer or manager)
  router.get("/:id/profile", verifyToken, customers.findOne);

  app.use("/api/customers", router);
};
