const db = require("../models");
const RestaurantReview = db.restaurantReview;
const User = db.user;
const Restaurant = db.restaurant;

// Get user's recent reviews
exports.getUserReviews = async (req, res) => {
  console.log("Fetching reviews for user:", req.params.userId);
  try {
    const userId = req.params.userId;

    const reviews = await RestaurantReview.findAll({
      where: { userId: userId },
      include: [
        {
          model: Restaurant,
          as: "reviewedRestaurant", // Updated to match the model association
          attributes: ["name", "address"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.status(200).send({
      status: "success",
      data: reviews,
    });
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: err.message || "Some error occurred while retrieving reviews.",
    });
  }
};

// Add a new review
exports.addReview = async (req, res) => {
  try {
    const { userId, restaurantId, review } = req.body;

    const newReview = await RestaurantReview.create({
      userId,
      restaurantId,
      review,
    });

    res.status(201).send({
      status: "success",
      data: newReview,
    });
  } catch (err) {
    res.status(500).send({
      status: "error",
      message: err.message || "Some error occurred while creating the review.",
    });
  }
};
