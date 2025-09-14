module.exports = (app) => {
  const buffetDetails = require("../controllers/buffetdetails.controller.js");
  const router = require("express").Router();

  // Get buffet details for a restaurant
  router.get("", buffetDetails.getBuffetDetails);
  // Save/update buffet details for a restaurant
  router.post("", buffetDetails.saveBuffetDetails);
  router.post("/status", buffetDetails.setBuffetStatus);
  router.post("/all-status", buffetDetails.setAllBuffetsStatus);

  app.use("/api/buffetdetails", router);
};
