const db = require("../models");

// Add a restaurant to user favorites
exports.addFavorite = async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        status: "error",
        message: "userId and restaurantId are required",
      });
    }

    // Check if favorite already exists
    const existingFavorite = await db.userFavorite.findOne({
      where: { userId, restaurantId }
    });

    if (existingFavorite) {
      return res.status(400).json({
        status: "error",
        message: "Restaurant is already in favorites",
      });
    }

    // Create new favorite
    const newFavorite = await db.userFavorite.create({
      userId,
      restaurantId,
    });

    res.status(201).json({
      status: "success",
      message: "Restaurant added to favorites",
      data: newFavorite,
    });
  } catch (error) {
    console.error("Error in addFavorite:", error);
    res.status(500).json({
      status: "error",
      message: "Error adding restaurant to favorites",
      error: error.message,
    });
  }
};

// Remove a restaurant from user favorites
exports.removeFavorite = async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        status: "error",
        message: "userId and restaurantId are required",
      });
    }

    const deletedRows = await db.userFavorite.destroy({
      where: { userId, restaurantId }
    });

    if (deletedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Favorite not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Restaurant removed from favorites",
    });
  } catch (error) {
    console.error("Error in removeFavorite:", error);
    res.status(500).json({
      status: "error",
      message: "Error removing restaurant from favorites",
      error: error.message,
    });
  }
};

// Get all favorite restaurants for a user
exports.getUserFavorites = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "userId is required",
      });
    }

    const favorites = await db.userFavorite.findAll({
      where: { userId },
      include: [
        {
          model: db.restaurant,
          as: "ratedRestaurant",
          attributes: [
            "id",
            "name",
            "address",
            "logoImage",
            "restaurantType",
            "latitude",
            "longitude",
            "enableBuffet",
            "enableVeg",
            "enableNonveg",
            "enableTableService",
            "enableSelfService"
          ]
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      data: favorites.map((f) => ({
        id: f.id,
        userId: f.userId,
        restaurantId: f.restaurantId,
        restaurant: f.ratedRestaurant ? {
          id: f.ratedRestaurant.id,
          name: f.ratedRestaurant.name,
          address: f.ratedRestaurant.address,
          logoImage: f.ratedRestaurant.logoImage,
          restaurantType: f.ratedRestaurant.restaurantType,
          latitude: f.ratedRestaurant.latitude,
          longitude: f.ratedRestaurant.longitude,
          enableBuffet: f.ratedRestaurant.enableBuffet,
          enableVeg: f.ratedRestaurant.enableVeg,
          enableNonveg: f.ratedRestaurant.enableNonveg,
          enableTableService: f.ratedRestaurant.enableTableService,
          enableSelfService: f.ratedRestaurant.enableSelfService,
        } : null,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error("Error in getUserFavorites:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching user favorites",
      error: error.message,
    });
  }
};

// Check if a restaurant is in user's favorites
exports.checkFavorite = async (req, res) => {
  try {
    const { userId, restaurantId } = req.query;

    if (!userId || !restaurantId) {
      return res.status(400).json({
        status: "error",
        message: "userId and restaurantId are required",
      });
    }

    const favorite = await db.userFavorite.findOne({
      where: { userId, restaurantId }
    });

    res.status(200).json({
      status: "success",
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Error in checkFavorite:", error);
    res.status(500).json({
      status: "error",
      message: "Error checking favorite status",
      error: error.message,
    });
  }
};