module.exports = (app) => {
  const reviews = require("../controllers/review.controller.js");
  const router = require("express").Router();

  // Get user's recent reviews
  router.get("/user/:userId", reviews.getUserReviews);

  // Add new review
  router.post("/", reviews.addReview);

  app.use("/api/reviews", router);
};
