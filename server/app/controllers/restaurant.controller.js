const db = require("../models");
const Restaurant = db.restaurant;
const RestaurantType = db.restaurantType;
const RestaurantReview = db.restaurantReview;
const RestaurantRating = db.restaurantRating;
const Buffet = db.buffet; // Add Buffet model

// Create a new restaurant and copy first 10 menus from the database
exports.create = async (req, res) => {
  const sequelize = db.sequelize;
  try {
    const result = await sequelize.transaction(async (t) => {
      // Create restaurant
      const restaurant = await Restaurant.create(req.body, { transaction: t });
      console.log("✅ Restaurant created with ID:", restaurant.id);

      // Fetch first 10 menus from the menu table (any menus, regardless of restaurantId)
      const defaultMenus = await db.menu.findAll({
        attributes: ["name", "status", "icon"], // Only select fields needed for copying
        order: [["id", "ASC"]],
        limit: 10,
        raw: true, // Get plain objects instead of Sequelize instances
        transaction: t,
      });

      console.log(`📋 Found ${defaultMenus.length} default menus to copy`);

      // If there are menus, duplicate them for the newly created restaurant
      if (defaultMenus && defaultMenus.length > 0) {
        const menusToCreate = defaultMenus.map((m) => ({
          name: m.name,
          status: m.status !== undefined ? m.status : true,
          icon: m.icon || "",
          restaurantId: restaurant.id, // Assign to the new restaurant
        }));

        const createdMenus = await db.menu.bulkCreate(menusToCreate, { transaction: t });
        console.log(`✅ Successfully copied ${createdMenus.length} menus for restaurant ID ${restaurant.id}`);
      } else {
        console.log("⚠️ No default menus found in database to copy");
      }

      // Reload restaurant including its menus
      const created = await Restaurant.findByPk(restaurant.id, {
        include: [{ model: db.menu, as: "menus" }],
        transaction: t,
      });

      console.log(`✅ Restaurant loaded with ${created.menus ? created.menus.length : 0} menus`);
      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("❌ Error creating restaurant and copying menus:", err);
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

// Get a single restaurant by id with reviews and buffet details
exports.findOne = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      include: [
        {
          model: RestaurantReview,
          as: "restaurantReviews",
          attributes: ["id", "rating", "review", "createdAt", "userId"],
        },
        {
          model: Buffet,
          as: "buffets",
          attributes: [
            "id",
            "restaurantId",
            "name",
            "menu",
            "type",
            "price",
            "isActive",
          ],
          /*  where: {
            isAcrestaurantIdtive: true,
          }, */
          required: false, // Use left join to get restaurant even if no buffet exists
        },
      ],
      attributes: {
        include: [
          "id",
          "name",
          "address",
          // "enableBuffet",
          "enableVeg",
          "enableNonveg",
          "enableTableService",
          "enableSelfService",
          "ambianceImage",
          "logoImage",
          "upi",
          "createdAt",
          "updatedAt",
        ],
      },
    });

    if (!restaurant)
      return res.status(404).json({ error: "Restaurant not found" });

    // Format buffet times in Indian format
    /*  const formattedRestaurant = {
      ...restaurant.toJSON(),
      buffets: restaurant.buffets?.map((buffet) => ({
        ...buffet,
        startTime: new Date(buffet.startTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",  
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
        endTime: new Date(buffet.endTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }),
      })),
    };
 */
    res.status(200).json(restaurant);
  } catch (err) {
    console.error("Error in findOne:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update a restaurant
exports.update = async (req, res) => {
  try {
    const [updated] = await Restaurant.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a restaurant
exports.delete = async (req, res) => {
  try {
    const deleted = await Restaurant.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
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
    const reviews = await RestaurantReview.findAll({
      where: { restaurantId: req.params.id },
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all ratings for a restaurant
exports.getRatings = async (req, res) => {
  try {
    const ratings = await RestaurantRating.findAll({
      where: { restaurantId: req.params.id },
    });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getupi = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id, {
      attributes: ["upi"],
    });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json({ upi: restaurant.upi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
