module.exports = (app) => {
  const router = require("express").Router();
  const customers = require("../controllers/customer.controller.js");

  // Create a new Customer
  router.post("/", customers.create);

  // Retrieve all Customers
  router.get("/", customers.findAll);

  // Retrieve a single Customer with id
  router.get("/:id", customers.findOne);

  // Retrieve a Customer by phone number
  router.post("/login/", customers.findByPhone);

  // Update a Customer with id
  router.put("/:id", customers.update);

  // Delete a Customer with id
  router.delete("/:id", customers.delete);

  // Get customer profile with orders and favorites
  router.get("/:id/profile", customers.findOne);

  app.use("/api/customers", router);
};
