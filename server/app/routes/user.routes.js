// Save user allotted menu items (bulk)
 
const multer = require('multer');
const path = require('path');
module.exports = app => {
  const users = require("../controllers/user.controller.js");

  const router = require("express").Router();

  // File upload config
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../assets/images'));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  const upload = multer({ storage: storage });

  // User registration
  router.post("/register", users.register);
  // File upload endpoint
  router.post('/upload', upload.single('file'), users.uploadImage);

  // User login
  router.post("/login", users.login);
  // Restaurant manager login
  // router.post("/loginRestaurantUser", users.loginRestaurantUser);
  router.post('/addRestaurantUser', users.addRestaurantUser);

  // Middleware to verify token (example usage for protected routes)
  router.get("/protected", users.verifyToken, (req, res) => {
    res.status(200).send({ message: "This is a protected route!" });
  });


  // Dashboard and menu item endpoints
  router.get('/dashboard/:userId', users.getDashboardData); // period query param: week|month|year
  router.get('/:userId/allotted-menuitems', users.getUserMenuItems); // NEW: get user's allotted menu items
  router.post('/:userId/menu-items', users.addMenuItemToUser);

  // CRUD endpoints
  router.post('/', users.create);
  router.get('/', users.findAll);
  router.get('/:id', users.findOne);
  router.put('/:id', users.update);
  router.delete('/:id', users.delete);
 // Messaging endpoints
  router.post('/:userId/message', users.sendMessageToUser);
  router.get('/:userId/messages', users.getMessagesForUser);
    router.post('/:userId/allotted-menuitems', users.saveUserMenuItems);
  router.get('/restaurant-users', users.getRestaurantUsers);

  app.use("/api/users", router);
};