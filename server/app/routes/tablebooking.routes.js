module.exports = (app) => {
  const tableBookingController = require("../controllers/tablebooking.controller.js");
  var router = require("express").Router();

  // Create a new table booking
  router.post("/", tableBookingController.create);

  // Get all table bookings
  router.get("/", tableBookingController.findAll);

  // Get table booking summary by restaurant
  router.get(
    "/restaurant/:restaurantId/summary",
    tableBookingController.findTableBookingSummary
  );

  // Get a single table booking by ID
  router.get("/:id", tableBookingController.findOne);

  // Update a table booking by ID
  router.put("/:id", tableBookingController.update);

  // Delete a table booking by ID
  router.delete("/:id", tableBookingController.delete);

  // Get available tables for a restaurant
  router.get(
    "/available/:restaurantId/:userId",
    tableBookingController.getAvailableTables
  );

  app.use("/api/tablebookings", router);
};
