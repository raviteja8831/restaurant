const Restaurant = require('../models/restaurant.model');
const RestaurantType = require('../models/restauranttype.model');
const RestaurantReview = require('../models/restaurantreview.model');
const RestaurantRating = require('../models/restaurantrating.model');

// Create a new restaurant
exports.create = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all restaurants
exports.findAll = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single restaurant by id
exports.findOne = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant
exports.update = async (req, res) => {
  try {
    const [updated] = await Restaurant.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
exports.delete = async (req, res) => {
  try {
    const deleted = await Restaurant.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all types
exports.getTypes = async (req, res) => {
  try {
    const types = await RestaurantType.findAll();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all reviews for a restaurant
exports.getReviews = async (req, res) => {
  try {
    const reviews = await RestaurantReview.findAll({ where: { restaurantId: req.params.id } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all ratings for a restaurant
exports.getRatings = async (req, res) => {
  try {
    const ratings = await RestaurantRating.findAll({ where: { restaurantId: req.params.id } });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
