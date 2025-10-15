module.exports = (app) => {
  const express = require("express");
  const router = express.Router();
  const reviewController = require("../controllers/review.controller");

  router.get("/", reviewController.listReviews);
  router.get("/user", reviewController.getUserReviews);
  router.post("/add", reviewController.createReview);

  module.exports = router;
  app.use("/api/reviews", router);
};
