module.exports = app => {
  const users = require("../controllers/user.controller.js");

  const router = require("express").Router();

  // User registration
  router.post("/register", users.register);

  // User login
  router.post("/login", users.login);
  // Middleware to verify token (example usage for protected routes)
  router.get("/protected", users.verifyToken, (req, res) => {
    res.status(200).send({ message: "This is a protected route!" });
  });

    // CRUD endpoints
    router.post('/', users.create);
    router.get('/', users.findAll);
    router.get('/:id', users.findOne);
    router.put('/:id', users.update);
    router.delete('/:id', users.delete);

  app.use("/api/users", router);
};