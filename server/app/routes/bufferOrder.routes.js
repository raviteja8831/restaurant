const express = require("express");
const router = express.Router();
const buffetOrderController = require("../controllers/buffet.controller");

// Create a new buffet order
router.post("/create", buffetOrderController.create);

// Get all buffet orders
router.get("/", buffetOrderController.findAll);

// Get a single buffet order by id
router.get("/:id", buffetOrderController.findOne);

// Update a buffet order
router.put("/:id", buffetOrderController.update);

// Delete a buffet order
router.delete("/:id", buffetOrderController.delete);

module.exports = (app) => {
  app.use("/api/buffet", router);
};
