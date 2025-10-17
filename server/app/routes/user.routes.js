// Save user allotted menu items (bulk)

const multer = require("multer");
const path = require("path");
const { verifyToken, verifyRestaurantUser, verifyManager } = require("../middleware/authMiddleware");
const {
  ensureUploadDir,
  getUploadFilename,
} = require("../utils/imageUploadHelper.js");

module.exports = (app) => {
  const users = require("../controllers/user.controller.js");

  const router = require("express").Router();

  // File upload config - using imageUploadHelper for consistent naming
  const uploadDir = path.join(__dirname, "../../assets/images");
  ensureUploadDir(uploadDir);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, getUploadFilename(file));
    },
  });
  const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  });

  // User registration
  router.post("/register", users.register);
  // File upload endpoint
  router.post("/upload", upload.single("file"), users.uploadImage);

  // User login
  router.post("/login", users.login);
  // Restaurant manager login
  // router.post("/loginRestaurantUser", users.loginRestaurantUser);
  router.post("/registerRestaurantUser", users.addRestaurantUser);

  // Get user profile with reviews and transactions (protected)
  router.get("/profile/:userId", verifyToken, users.getUserProfile);

  // Get recent orders for a user (protected)
  router.get("/recent-orders", verifyToken, users.getRecentOrders);

  // Middleware to verify token (example usage for protected routes)
  router.get("/protected", verifyToken, (req, res) => {
    res.status(200).send({ message: "This is a protected route!" });
  });

  // Dashboard and menu item endpoints (restaurant user access)
  router.get("/restaurant-users", users.getRestaurantUsers);
  router.get("/dashboard/:userId", users.getDashboardData); // period query param: week|month|year
  router.get("/:userId/allotted-menuitems", users.getUserMenuItems); // NEW: get user's allotted menu items
  router.post("/:userId/menu-items", users.addMenuItemToUser); // Only managers can add menu items

  // CRUD endpoints (manager access only)
  router.get("/", users.findAll);
  router.get("/:id", users.findOne);
  router.put("/:id", users.update);
  router.delete("/:id", users.delete);

  // Messaging endpoints (restaurant user access)
  router.post("/:userId/message", users.sendMessageToUser);
  router.get("/:userId/messages", users.getMessagesForUser);
  router.post("/:userId/allotted-menuitems", users.saveUserMenuItems); // Only managers can allot menu items

  app.use("/api/users", router);
};
