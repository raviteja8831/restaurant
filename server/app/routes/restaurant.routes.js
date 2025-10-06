const { verifyToken, verifyManager } = require("../middleware/authMiddleware");

module.exports = app => {
	const restaurant = require('../controllers/restaurant.controller');
	var router = require('express').Router();

	// Create restaurant (manager only)
	router.post('/', verifyManager, restaurant.create);

	// Get all restaurants (any authenticated user)
	router.get('/', verifyToken, restaurant.findAll);

	// Get single restaurant (any authenticated user)
	router.get('/:id', verifyToken, restaurant.findOne);

	// Update restaurant (manager only)
	router.put('/:id', verifyManager, restaurant.update);

	// Delete restaurant (manager only)
	router.delete('/:id', verifyManager, restaurant.delete);

	app.use('/api/restaurants', router);
};
