const db = require("../models");
const { Op } = require("sequelize");
// Use Op directly instead of db.Sequelize.Op
// Load environment variables
require('dotenv').config();

// Secret key for JWT from environment variable
const SECRET_KEY = process.env.JWT_SECRET || "your_super_secret_key";

// Debug: Log JWT secret loading for user controller
console.log('🔑 User Controller - JWT Secret:', SECRET_KEY ? 'Loaded' : 'Missing');

const jwt = require("jsonwebtoken");

// Time formatting helpers
const formatIndianDateTime = (date) => {
  const options = {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-IN", options).replace(",", "");
};

const formatShortTime = (date) => {
  const options = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-IN", options);
};
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, getUploadFilename(file));
  },
});
const {
  ensureUploadDir,
  getUploadFilename,
} = require("../utils/imageUploadHelper.js");
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "../../assets/images");
ensureUploadDir(uploadDir);

const User = db.users;
const Role = db.roles;

// Get user profile with orders, favorites and transactions
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user details
    const user = await db.users.findOne({
      where: { id: userId },
      attributes: ["id", "firstname", "lastname", "phone", "email"],
    });

    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "User not found",
      });
    }

    // Get recent orders with details (all statuses: PENDING, PLACED, PREPARING, PREPARED, SERVED, PAID, COMPLETED)
    const orders = await db.orders.findAll({
      where: {
        userId,
        status: {
          [Op.in]: ["PENDING", "PLACED", "PREPARING", "PREPARED", "SERVED", "PAID", "COMPLETED"]
        }
      },
      include: [
        {
          model: db.restaurant,
          as: "orderRestaurant",
          attributes: ["name", "address", "id"], //, "image"
        },
        {
          model: db.orderProducts,
          as: "orderProducts",
          include: [
            {
              model: db.menuItem,
              as: "menuitem",
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20, // Increased limit to show more orders
    });
    const tableOrders = await db.tableBooking.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["name", "address"],
        },
        {
          model: db.restaurantTable,
          as: "table",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      // limit: 5,
    });
    const bufferOrders = await db.buffetOrder.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: db.buffet,
          as: "buffet",
          attributes: ["name", "price"],
        },
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["name", "address"],
        },
      ],
      order: [["createdAt", "DESC"]],
      // limit: 5,
    });

    // Format orders for response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      restaurantId: order?.orderRestaurant?.id,
      restaurantName: order?.orderRestaurant?.name,
      restaurantAddress: order?.orderRestaurant?.address,
      restaurantImage: order?.orderRestaurant?.image,
      date: new Date(order?.createdAt).toLocaleDateString(),
      time: new Date(order?.createdAt).toLocaleTimeString(),
      totalAmount: order?.total,
      status: order?.status, // Include order status
      method: order?.paymentMethod,
      items: order?.orderProducts?.map((product) => ({
        name: product?.menuitem?.name,
        quantity: product?.quantity,
        price: product?.menuitem?.price,
        total: product?.quantity * product?.menuitem?.price,
      })),
    }));
    const favorites = await db.restaurantReview.findAll({
      where: {
        userId,
        rating: 5,
      },
      include: [
        {
          model: db.restaurant,
          as: "reviewedRestaurant",
          attributes: ["id", "name", "address"], //, "image"
        },
      ],
    });

    // Format favorites for response
    const formattedFavorites = favorites.map((favorite) => ({
      id: favorite.id,
      restaurantId: favorite?.reviewedRestaurant?.id,
      restaurantName: favorite?.reviewedRestaurant?.name,
      restaurantAddress: favorite?.reviewedRestaurant?.address,
      restaurantImage: favorite?.reviewedRestaurant?.image,
      review: favorite?.review,
      rating: favorite?.rating,
      addedAt: new Date(favorite?.createdAt).toLocaleDateString(),
    }));
    return res.status(200).send({
      status: "success",
      data: {
        user: {
          id: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          phoneNumber: user.phone,
          email: user.email,
        },
        orders: formattedOrders,
        favorites: formattedFavorites,
        tableOrders: tableOrders,
        bufferOrders: bufferOrders,
        // payments: formattedPayments,
      },
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return res.status(500).send({
      status: "error",
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Get users by restaurantId and roleId
exports.getRestaurantUsers = async (req, res) => {
  const { restaurantId, roleId } = req.query;
  console.log(restaurantId, roleId);

  if (!restaurantId || !roleId) {
    return res
      .status(400)
      .json({ error: "restaurantId and roleId are required" });
  }
  try {
    const users = await db.restaurantUser.findAll({
      where: { restaurantId: restaurantId, role_id: roleId },
      attributes: [
        "id",
        "phone",
        "firstname",
        "lastname",
        "role_id",
        "restaurantId",
        "userImage",
        "createdAt",
        "updatedAt",
      ],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get allotted menu items for a user
exports.getUserMenuItems = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await db.restaurantUser.findByPk(userId, {
      attributes: ["id", "firstname", "lastname", "phone"],
      include: [
        {
          model: db.menuItem,
          as: "allottedMenuItems",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ menuItems: user.allottedMenuItems });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Save user allotted menu items (bulk)
exports.saveUserMenuItems = async (req, res) => {
  // Accept userId from body if present, else from params
  const userId = req.body.userId || req.params.userId;
  const { menuitemIds } = req.body;
  if (!Array.isArray(menuitemIds))
    return res.status(400).json({ error: "menuitemIds must be array" });
  try {
    const user = await db.restaurantUser.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.setAllottedMenuItems(menuitemIds);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Send a message to a user (simple in-memory, for demo)
let userMessages = {};

// Send a message to a user (persisted in UserMessage model)
exports.sendMessageToUser = async (req, res) => {
  const { userId } = req.params;
  const { message, from } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });
  // if (!fromUserId || !fromRoleId || !toRoleId) return res.status(400).json({ error: "fromUserId, fromRoleId, toRoleId required" });
  try {
    await db.message.create({
      fromUserId: from,
      fromRoleId:1,
      toUserId: userId,
      toRoleId:2,
      message
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages for a user (from UserMessage model)
exports.getMessagesForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const messages = await db.message.findAll({
      where: { toUserId: userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: db.restaurantUser,
          as: 'fromUser',
          attributes: ['id', 'firstname', 'lastname', 'phone', 'role_id', 'restaurantId'],
          include: [
            {
              model: db.roles,
              as: 'role',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: db.restaurantUser,
          as: 'toUser',
          attributes: ['id', 'firstname', 'lastname', 'phone', 'role_id', 'restaurantId'],
          include: [
            {
              model: db.roles,
              as: 'role',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get dashboard data for a user (profile, allotted menu, stats, top orders, today's orders)
exports.getDashboardData = async (req, res) => {
  const { userId } = req.params;
  const { period = "week" } = req.query;
  try {
    // Get user profile and restaurantId
    const user = await db.restaurantUser.findByPk(userId, {
      attributes: ["id", "firstname", "lastname", "phone", "restaurantId"],
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const restaurantId = user.restaurantId;
    // Get allotted menu items for this user (actual menu items, not join table)
    const userWithMenu = await db.restaurantUser.findByPk(userId, {
      include: [
        {
          model: db.menuItem,
          as: "allottedMenuItems",
          attributes: ["id", "name"],
        },
      ],
    });
    const allottedMenuItems =
      userWithMenu && userWithMenu.allottedMenuItems
        ? userWithMenu.allottedMenuItems
        : [];
    const allottedMenuItemIds = allottedMenuItems.map((mi) => mi.id);

    // Get today's login time for the chef from ChefLogin model
    let todayLoginTime = null;
    let chefLogin = null;

    // First check if the user is a chef (role_id === 2 for chefs)
    const userRole = await db.restaurantUser.findOne({
      where: { id: userId, role_id: 2 }, // 2 is the role_id for chefs
      attributes: ["id"],
    });

    if (userRole) {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const todayFormatted = formatIndianDateTime(todayStart).split(" ")[0]; // Get only the date part

      console.log("Searching for chef login with:", {
        userId,
        todayFormatted,
      });

      chefLogin = await db.chefLogin.findOne({
        where: {
          chefId: userId,
          loginTime: {
            [Op.like]: `${todayFormatted}%`, // Match any login time from today
          },
          logoutTime: null, // Only get active login sessions
        },
        order: [["loginTime", "DESC"]],
      });

      console.log("Found chef login:", chefLogin);
    }

    if (chefLogin) {
      console.log("Raw loginTime value:", chefLogin.loginTime);
      // Format the login time in Indian format
      todayLoginTime = chefLogin.loginTime.split(" ").slice(1).join(" ");
      console.log("Formatted login time:", todayLoginTime);
    }

    // Get order stats (total, week/month/year) for this restaurant
    const now = new Date();
    let startDate;
    if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      // week
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
    }

    // Total orders for period (for this restaurant)
    const totalOrders = await db.orders.count({
      where: { restaurantId, createdAt: { [db.Sequelize.Op.gte]: startDate } },
    });
    // Total orders all time (for this restaurant)
    const totalOrdersAll = await db.orders.count({ where: { restaurantId } });

    // Today's date
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Top 3 orders for today (by menu items allotted to this user)
    let topOrders = [];
    if (allottedMenuItemIds.length > 0) {
      topOrders = await db.orderProducts.findAll({
        attributes: [
          "menuitemId",
          [db.Sequelize.fn("COUNT", db.Sequelize.col("menuitemId")), "count"],
        ],
        include: [
          {
            model: db.menuItem,
            as: "menuitem",
            attributes: ["id", "name", "createdAt"],
          },
          {
            model: db.orders,
            as: "order",
            attributes: [],
            where: {
              restaurantId,
              createdAt: { [db.Sequelize.Op.gte]: startOfDay },
            },
          },
        ],
        where: { menuitemId: allottedMenuItemIds },
        group: ["menuitemId", "menuitem.id", "menuitem.name"],
        order: [[db.Sequelize.literal("count"), "DESC"]],
        limit: 3,
      });
    }

    // Today's order list (orders for this restaurant, with at least one product in allottedMenuItemIds)
    let todaysOrders = [];
    if (allottedMenuItemIds.length > 0) {
      const orders = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [db.Sequelize.Op.gte]: startOfDay },
        },
        include: [
          {
            model: db.orderProducts,
            as: "orderProducts",
            where: { menuitemId: allottedMenuItemIds },
            required: true,
            include: [
              {
                model: db.menuItem,
                as: "menuitem",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      todaysOrders = orders;
    }

    res.json({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        phone: user.phone,
        restaurantId: user.restaurantId,
        allottedMenuItems,
      },
      todayLoginTime,
      totalOrders,
      totalOrdersAll,
      topOrders: topOrders.map((o) => ({
        id: o.menuitem?.id,
        name: o.menuitem?.name,
        count: o.dataValues.count,
      })),
      todaysOrders: todaysOrders.map((order) => ({
        id: order.id,
        time: order.createdAt,
        items: (order.orderProducts || []).map((op) => {
          console.log("Order Product:", op);
          const opPlain =
            typeof op.get === "function" ? op.get({ plain: true }) : op;
          console.log("Order Product Plain:", opPlain);
          // Ensure op and op.menuitem are plain objects
          const menuitem = op.menuitem || {};
          return {
            id: menuitem.id,
            name: menuitem.name,
            qty: opPlain.quantity || 1,
          };
        }),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a menu item to a user
exports.addMenuItemToUser = async (req, res) => {
  const { userId } = req.params;
  const { menuitemId } = req.body;
  try {
    const user = await db.users.findByPk(userId);
    const menuitem = await db.menuItem.findByPk(menuitemId);
    if (!user || !menuitem)
      return res.status(404).json({ error: "User or Menu Item not found" });
    await user.addAllottedMenuItem(menuitem);
    res.json({ message: "Menu item added to user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// File upload handler
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }
    // Save file URL (relative to server)
    const fileUrl = `/assets/images/${req.file.filename}`;
    res.status(200).send({ url: fileUrl });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Add Restaurant User (Chef or other role)

// User registration (manager)
exports.register = async (req, res) => {
  console.log("--- Register endpoint hit ---");
  console.log("Request object:", req);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  try {
    const {
      phone,

      firstname,

      lastname,

      name,

      restaurantAddress,

      ambianceImage,
      upi,
      logo,
      enableBuffet,
      enableVeg,
      enableNonveg,
      enableTableService,
      enableSelfService,
      latitude,
      longitude,
      restaurantType,
    } = req.body;
console.log(req.body);

    let logoImageUrl = logo;

    // Create restaurant first
    const restaurant = await db.restaurant.create({
      name: name,
      address: restaurantAddress,
      enableBuffet: enableBuffet === true || enableBuffet === "true",
      enableVeg: enableVeg === true || enableVeg === "true",
      enableNonveg: enableNonveg === true || enableNonveg === "true",
      enableTableService:
        enableTableService === true || enableTableService === "true",
      enableSelfService:
        enableSelfService === true || enableSelfService === "true",
      ambianceImage: ambianceImage || null,
      logoImage: logoImageUrl,
      latitude: latitude || null,
      longitude: longitude || null,
      upi: upi || null,
      restaurantType: restaurantType || "Other",
    });

    // Create manager user for the restaurant
    const managerUser = await db.restaurantUser.create({
      phone,
      firstname,
      lastname,
      restaurantId: restaurant.id,
      role_id: 1, // 1 = manager
    });

    res.status(201).send({
      message: "Manager and restaurant registered successfully!",
      managerUser,
      restaurant,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// User login with phone and OTP
exports.login = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // Find user by phone
    const user = await db.restaurantUser.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: db.restaurant,
          as: "restaurant",
        },
      ],
    });
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }
    // Mock OTP validation (replace with real OTP logic)
    if (otp !== "1234") {
      return res.status(401).send({ message: "Invalid OTP!" });
    }
    // Generate JWT token (extended expiration for better UX)
    console.log('🔑 Generating token for user:', user.id, 'with secret:', SECRET_KEY ? 'Available' : 'Missing');
    const token = jwt.sign(
      { id: user.id, role: user.role?.name, phone: user.phone },
      SECRET_KEY,
      { expiresIn: "7d" } // Extended to 7 days for better user experience
    );
    console.log('✅ Token generated successfully');
    res.status(200).send({
      id: user.id,
      phone: user.phone,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role || null,
      restaurant: user.restaurant || null,
      token, // <-- send token in response
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Get all users
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.findOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user (for restaurantUser, including password and role)
exports.update = async (req, res) => {
  try {
    const { firstname, lastname, phone, password, role_id } = req.body;
    const updateFields = { firstname, lastname, phone };
    if (role_id !== undefined) updateFields.role_id = role_id;
    if (password) {
      const bcrypt = require("bcryptjs");
      updateFields.password = await bcrypt.hash(password, 10);
    }
    const [updated] = await db.restaurantUser.update(updateFields, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.delete = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};
exports.addRestaurantUser = async (req, res) => {
  try {
    // Accept both restaurant_id and restaurantId from request
    const {
      firstname,
      lastname = "",
      password,
      phone,
      restaurantId,
      role_id,
      userImage,
    } = req.body;

    // Use restaurant_id or restaurantId (prefer restaurant_id if both)
    const restId = restaurantId;

    if (!firstname || !password || !role_id || !phone || !restId) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.restaurantUser.create({
      firstname: firstname,
      lastname: lastname,
      password: hashedPassword,
      role_id: role_id,
      phone,
      restaurantId: restId,
      userImage: userImage,
    });
    return res.status(201).send({
      message: "User added to existing restaurant successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
