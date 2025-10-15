module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const favoritesController = require("../controllers/favorites.controller");

  router.get("/", favoritesController.getUserFavorites);
  router.get("/check", favoritesController.checkFavorite);
  router.post("/add", favoritesController.addFavorite);
  router.delete("/remove", favoritesController.removeFavorite);

  module.exports = router;
  app.use("/api/favorites", router);
};