module.exports = (app) => {
  const express = require("express");

  const router = express.Router();
  const chefController = require("../controllers/chef.controller");
  const auth = require("../middleware/auth");

  router.post("/login", chefController.chefLogin);
  // router.get('/profile', auth, chefController.chefProfile);
  // router.get('/dashboard', auth, chefController.chefDashboard);
  // router.get('/messages', auth, chefController.chefMessages);
  // router.post('/messages', auth, chefController.sendChefMessage);
  router.get("/profile", chefController.chefProfile);
  router.get("/dashboard/:id", chefController.chefDashboard);
  router.get("/messages/:userId", chefController.chefMessages);
  router.post("/messages", chefController.sendChefMessage);
  router.post("/logout", chefController.chefLogout); // Protected logout route
  router.post("/updateorders/status/", chefController.updateOrderStatus);

  app.use("/api/chef", router);
};
