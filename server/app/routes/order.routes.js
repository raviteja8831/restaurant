const { verifyToken } = require("../controllers/user.controller.js");

module.exports = (app) => {
  const orders = require("../controllers/order.controller.js");

  const router = require("express").Router();

  // Fetch orders based on user role
  router.get("/role-based", verifyToken, orders.getOrdersByRole);
    router.post('/', orders.createOrder);
    router.get('/', orders.findAll);
    router.get('/:id', orders.findOne);
    router.put('/:id', orders.updateOrder);
    router.delete('/:id', orders.deleteOrder);
    router.get('/user/:user_id', orders.findByUserId);
    router.get('/by-user', orders.getOrdersByUser);

    app.use('/api/orders', router);

};