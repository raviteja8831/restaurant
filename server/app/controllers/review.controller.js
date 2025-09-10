const db = require("../models");

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { userId, restaurantId, rating, review, orderId } = req.body;

    if (!userId || !restaurantId || !rating) {
      return res.status(400).json({
        status: "error",
        message: "userId, restaurantId, and rating are required",
      });
    }

    const newReview = await db.restaurantReview.create({
      userId,
      restaurantId,
      rating,
      review,
      orderId,
    });

    // Get the created review with user details
    const reviewWithUser = await db.restaurantReview.findOne({
      where: { id: newReview.id },
      include: [
        { model: db.users, as: "user", attributes: ["firstname", "lastname"] },
      ],
    });

    res.status(201).json({
      status: "success",
      data: reviewWithUser,
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating review",
      error: error.message,
    });
  }
};

// List all reviews for a restaurant
exports.listReviews = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId)
      return res.status(400).json({ message: "restaurantId required" });
    const reviews = await db.restaurantReview.findAll({
      where: { restaurantId },
      attributes: [
        "id",
        "userId",
        "restaurantId",
        "rating",
        "review",
        "createdAt",
      ],
      include: [
        { model: db.users, as: "user", attributes: ["firstname", "lastname"] },
        { model: db.restaurant, as: "restaurant", attributes: ["name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(
      reviews.map((r) => ({
        id: r.id,
        user: r.user ? `${r.user.firstname} ${r.user.lastname}` : "",
        restaurant: r.restaurant ? r.restaurant.name : "",
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
