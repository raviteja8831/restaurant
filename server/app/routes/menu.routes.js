const { verifyToken, verifyRestaurantUser, verifyManager } = require("../middleware/authMiddleware");

module.exports = (app) => {
  const menu = require("../controllers/menu.controller");
  var router = require("express").Router();

  // Create menu (manager only)
  router.post("/", verifyManager, menu.create);

  // Get all menus (any authenticated user)
  router.get("/", verifyToken, menu.findAll);

  // Get menu with items for restaurant (any authenticated user)
  router.get("/with-items/:restaurantId", verifyToken, menu.getMenuWithItems);

  // Get items based on menu (any authenticated user)
  router.get("/items/:menuId", verifyToken, menu.getItemsBasedOnMenu);

  // Get single menu (any authenticated user)
  router.get("/:id", verifyToken, menu.findOne);

  // Update menu (manager only)
  router.put("/:id", verifyManager, menu.update);

  // Delete menu (manager only)
  router.delete("/:id", verifyManager, menu.delete);

  app.use("/api/menus", router);
};
