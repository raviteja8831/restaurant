const db = require('../models');

// List all reviews for a restaurant
exports.listReviews = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ message: 'restaurantId required' });
    const reviews = await db.restaurantReview.findAll({
      where: { restaurantId },
      attributes: ['id', 'userId', 'restaurantId', 'rating', 'review', 'createdAt'],
      include: [
        { model: db.users, as: 'user', attributes: ['firstname', 'lastname'] },
        { model: db.restaurant, as: 'restaurant', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews.map(r => ({
      id: r.id,
      user: r.user ? `${r.user.firstname} ${r.user.lastname}` : '',
      restaurant: r.restaurant ? r.restaurant.name : '',
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
