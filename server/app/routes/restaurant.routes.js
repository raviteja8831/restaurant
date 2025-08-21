const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');

router.post('/', restaurantController.create);
router.get('/', restaurantController.findAll);
router.get('/:id', restaurantController.findOne);
router.put('/:id', restaurantController.update);
router.delete('/:id', restaurantController.delete);

module.exports = router;
module.exports = app => {
	const restaurant = require('../controllers/restaurant.controller');
	var router = require('express').Router();

	router.post('/', restaurant.create);
	router.get('/', restaurant.findAll);
	router.get('/:id', restaurant.findOne);
	router.put('/:id', restaurant.update);
	router.delete('/:id', restaurant.delete);

	app.use('/api/restaurants', router);
};
