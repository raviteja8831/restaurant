const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../models");
const { Sequelize } = require("sequelize");

const restaurantUser = db.restaurantUser;
const Order = db.orders;
const MenuItem = db.menuItem;
const userMenuItem = db.userMenuItem;
const message = db.message;
const roles = db.roles;
const OrderStatus = db.orderStatus;

const chefController = {};

// Helper function to format date in Indian format (DD/MM/YYYY HH:MM:SS AM/PM)
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

// Helper function to format time in short format (HH:MM AM/PM)
const formatShortTime = (date) => {
  const options = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(date)
    .toLocaleString("en-IN", options)
    .replace(/,/g, "")
    .trim();
};

chefController.chefLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log("Login attempt for phone:", phone, password);
    const chef = await restaurantUser.findOne({
      where: { phone },
      include: [{ model: roles, as: "role" }],
    });
    console.log("Chef found:", chef);
    if (!chef || !chef.role || chef.role.id != "2") {
      console.error("Chef not found or role missing:", chef);
      return res.status(404).json({ message: "Chef not found" });
    }

    const valid = await bcrypt.compare(password, chef.password);
    if (!valid) {
      console.error("Invalid password for chef:", chef.phone);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set in environment");
      return res.status(500).json({ message: "JWT secret not configured" });
    }
    const token = jwt.sign(
      { id: chef.id, role: chef.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Extended to 7 days for consistency
    );
    console.log('✅ Chef token generated successfully for:', chef.id);

    // Create chef login record with formatted Indian time
    const formattedTime = formatIndianDateTime(new Date());
    const loginRecord = await db.chefLogin.create({
      chefId: chef.id,
      restaurantId: chef.restaurantId,
      loginTime: formattedTime, // Store the formatted time string
    });

    // Only send public fields as 'user' for frontend compatibility
    const {
      id,
      phone: chefPhone,
      firstname,
      lastname,
      role,
      restaurantId,
      profileImage,
      image_url,
    } = chef;
    res.json({
      token,
      user: {
        id,
        phone: chefPhone,
        firstname,
        lastname,
        role,
        restaurantId,
        profileImage: profileImage || image_url || null,
        loginAT: formatShortTime(new Date()),
      },
    });
  } catch (e) {
    console.error("Chef login error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

chefController.chefProfile = async (req, res) => {
  try {
    const chef = await restaurantUser.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
      include: [{ model: roles, as: "role" }],
    });
    if (!chef || chef.role.name !== "Chef")
      return res.status(404).json({ message: "Chef not found" });
    res.json(chef);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

chefController.chefDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = parseInt(id, 10);

    if (!chefId || isNaN(chefId)) {
      console.error("Invalid chef ID provided:", id);
      return res.status(400).json({ message: "Invalid chef ID" });
    }

    console.log("=== Chef Dashboard Request ===");
    console.log("Chef ID:", chefId);

    // Get menuitems allotted to chef
    const chef = await restaurantUser.findByPk(chefId, {
      include: [{
        model: MenuItem,
        as: "allottedMenuItems",
        attributes: ["id", "name", "price"],
      }],
    });

    if (!chef) {
      console.error("Chef not found with ID:", chefId);
      return res.status(404).json({ message: "Chef not found" });
    }

    console.log("Chef found:", chef.firstname, chef.lastname);
    console.log("Allotted menu items:", chef.allottedMenuItems?.length || 0);

    const menuItemIds = chef && chef.allottedMenuItems ? chef.allottedMenuItems.map((item) => item.id) : [];
    console.log("Menu Item IDs allotted to chef:", menuItemIds);

    // Get orders containing these menuitems
    let orders = [];
    let allOrders = [];
    let totalOrders = 0;
    let workingDays = 0;
    let mostOrdered = [];

    if (menuItemIds.length > 0) {
      try {
        // Get active orders (not served) for chef home screen
        orders = await Order.findAll({
          include: [
            {
              model: db.orderProducts,
              as: "orderProducts",
              where: {
                menuitemId: { [Op.in]: menuItemIds },
                status: { [Op.ne]: 'SERVED' }, // Exclude served orders
              },
              required: true,
              include: [
                {
                  model: MenuItem,
                  as: "menuitem",
                  attributes: ["id", "name", "price"],
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 20,
        });

        console.log("Active orders fetched:", orders.length);

        // Get all orders (including served) for statistics
        allOrders = await Order.findAll({
          include: [
            {
              model: db.orderProducts,
              as: "orderProducts",
              where: {
                menuitemId: { [Op.in]: menuItemIds },
              },
              required: true,
              include: [
                {
                  model: MenuItem,
                  as: "menuitem",
                  attributes: ["id", "name", "price"],
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
        });

        console.log("Total orders (all time):", allOrders.length);
      } catch (err) {
        console.error("Order query failed:", err);
        return res
          .status(500)
          .json({ message: "Order query failed", error: err.message });
      }

      // Count total order items with ORDERED, PREPARING, READY, and SERVED statuses
      totalOrders = await db.orderProducts.count({
        where: {
          menuitemId: { [Op.in]: menuItemIds },
          status: { [Op.in]: ['ORDERED', 'PREPARING', 'READY', 'SERVED'] },
        },
      });
      console.log("Total order items (ORDERED/PREPARING/READY/SERVED) for chef:", totalOrders);

      // Calculate actual working days from chef login records (similar to manager approach)
      try {
        // Count distinct dates when chef logged in
        const uniqueLoginDays = await db.chefLogin.findAll({
          where: { chefId: chefId },
          attributes: [
            [Sequelize.fn("DATE", Sequelize.col("createdAt")), "loginDate"],
          ],
          group: [Sequelize.fn("DATE", Sequelize.col("createdAt"))],
          raw: true,
        });
        workingDays = uniqueLoginDays.length;
        console.log("Working days calculated:", workingDays, "unique days:", uniqueLoginDays);
      } catch (err) {
        console.error("Error calculating working days:", err);
        workingDays = 0;
      }

      // Most ordered dish
      try {
        mostOrdered = await db.orderProducts.findAll({
          where: { menuitemId: { [Op.in]: menuItemIds } },
          attributes: [
            "menuitemId",
            [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalQuantity"],
          ],
          group: ["menuitemId", "menuitem.id", "menuitem.name"],
          order: [[Sequelize.literal("totalQuantity"), "DESC"]],
          limit: 5,
          include: [
            {
              model: MenuItem,
              as: "menuitem",
              attributes: ["id", "name"],
            },
          ],
        });
        console.log("Most ordered items:", mostOrdered.length);
      } catch (err) {
        console.error("Error fetching most ordered:", err);
        mostOrdered = [];
      }
    } else {
      console.warn("No menu items allotted to this chef");
    }

    // Get today's date range (similar to manager controller approach)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find today's login record using date range instead of string matching
    // First try to get active session (no logout)
    let loginRecord = await db.chefLogin.findOne({
      where: {
        chefId: chefId,
        createdAt: {
          [Op.gte]: todayStart,
          [Op.lte]: todayEnd,
        },
        logOutTime: null, // Get active session
      },
      order: [["createdAt", "DESC"]],
    });

    // If no active session, get the most recent login today (even if logged out)
    if (!loginRecord) {
      loginRecord = await db.chefLogin.findOne({
        where: {
          chefId: chefId,
          createdAt: {
            [Op.gte]: todayStart,
            [Op.lte]: todayEnd,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    }

    let loginHours = 0;
    let loginTime = null;
    let logoutTime = null;

    if (loginRecord) {
      // Parse login time (Indian format or use createdAt as fallback)
      loginTime = loginRecord.loginTime || formatShortTime(loginRecord.createdAt);

      // Helper to parse Indian date time format (consistent with manager controller)
      const parseIndianDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return null;

        try {
          const parts = dateTimeStr.trim().split(' ');
          if (parts.length < 3) return null;

          const [datePart, timePart, period] = parts;
          const [day, month, year] = datePart.split('/');
          const [hours, minutes, seconds] = timePart.split(':');

          let hour = parseInt(hours);
          if (period && period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
          if (period && period.toLowerCase() === 'am' && hour === 12) hour = 0;

          return new Date(year, month - 1, day, hour, parseInt(minutes), parseInt(seconds || 0));
        } catch (err) {
          console.error("Error parsing date time:", err);
          return null;
        }
      };

      // Calculate working hours
      const startTime = loginRecord.loginTime
        ? parseIndianDateTime(loginRecord.loginTime)
        : loginRecord.createdAt;

      const endTime = loginRecord.logOutTime
        ? parseIndianDateTime(loginRecord.logOutTime)
        : new Date();

      if (startTime) {
        const diffMs = endTime - startTime;
        loginHours = Math.max(0, diffMs / (1000 * 60 * 60)).toFixed(2);
      }

      if (loginRecord.logOutTime) {
        logoutTime = loginRecord.logOutTime.split(" ").slice(1).join(" ");
      }
    }

    console.log("=== Response Summary ===");
    console.log("Active orders:", orders.length);
    console.log("All orders (for stats):", allOrders.length);
    console.log("Total completed orders:", totalOrders);
    console.log("Working days:", workingDays);
    console.log("Menu items:", chef?.allottedMenuItems?.length || 0);
    console.log("Most ordered:", mostOrdered.length);
    console.log("Login hours:", loginHours);

    res.json({
      orders: allOrders || [], // Send all orders for profile stats
      activeOrders: orders || [], // Send active orders for home screen
      totalOrders: totalOrders || 0,
      workingDays: workingDays || 0,
      menuItems: (chef && chef.allottedMenuItems) || [],
      mostOrdered: mostOrdered || [],
      todayStats: {
        loginTime: loginTime || null,
        logoutTime: logoutTime || null,
        loginHours: parseFloat(loginHours) || 0,
        isCurrentlyLoggedIn: loginRecord && !loginRecord.logOutTime,
      },
    });
  } catch (e) {
    console.error("=== Chef Dashboard Error ===");
    console.error(e);
    res.status(500).json({
      message: "Server error",
      error: e.message,
      stack: process.env.NODE_ENV === "development" ? e.stack : undefined,
    });
  }
};

chefController.chefMessages = async (req, res) => {
  try {
    // Get userId from route param, fallback to req.user.id
    const chefId = req.params.userId
      ? parseInt(req.params.userId, 10)
      : req.user?.id;
    if (!chefId) return res.status(400).json({ message: "Missing userId" });
    const chefRole = await roles.findOne({ where: { name: "Chef" } });
    const managerRole = await roles.findOne({ where: { name: "Manager" } });
    const messagesList = await message.findAll({
      where: {
        [Op.or]: [
          {
            fromUserId: chefId,
            // fromRoleId: chefRole.id,
            // toRoleId: managerRole.id,
          },
          {
            toUserId: chefId,
            // toRoleId: chefRole.id,
            // fromRoleId: managerRole.id,
          },
        ],
      },
      include: [
        {
          model: restaurantUser,
          as: "fromUser",
          attributes: ["id", "firstname", "lastname"],
          include: [
            {
              model: roles,
              as: "role",
              attributes: ["name"],
            },
          ],
        },
        {
          model: restaurantUser,
          as: "toUser",
          attributes: ["id", "firstname", "lastname"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ messages: messagesList });
  } catch (e) {
    console.error("Error fetching chef messages:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

chefController.chefLogout = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Chef ID is required" });
    }
    const chefId = parseInt(id, 10);
    const currentDate = new Date();
    const formattedTime = formatIndianDateTime(currentDate);

    // Get today's date as a string in Indian format
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayFormatted = formatIndianDateTime(todayStart).split(" ")[0]; // Get only the date part

    // Find today's login record for this chef that doesn't have a logout time
    const loginRecord = await db.chefLogin.findOne({
      where: {
        chefId: chefId,
        logOutTime: null,
        loginTime: {
          [Op.like]: `${todayFormatted}%`, // Match any login time from today
        },
      },
      order: [["loginTime", "DESC"]],
    });

    if (!loginRecord) {
      return res.status(400).json({
        message:
          "No active login session found for this chef today. Please login first.",
      });
    }

    // Update the logout time
    await loginRecord.update({
      logOutTime: formattedTime,
    });

    res.json({
      message: "Logged out successfully",
      logoutTime: formattedTime,
    });
  } catch (e) {
    console.error("Chef logout error:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

chefController.sendChefMessage = async (req, res) => {
  try {
    const chefId = req.user.id;
    const chefRole = await roles.findOne({ where: { name: "Chef" } });
    const managerRole = await roles.findOne({ where: { name: "Manager" } });
    // Find all managers in the same restaurant
    const chef = await restaurantUser.findByPk(chefId);
    const managers = await restaurantUser.findAll({
      where: { restaurantId: chef.restaurantId, role_id: managerRole.id },
    });
    const { message: msg } = req.body;
    // Send message to all managers
    for (const mgr of managers) {
      await message.create({
        fromUserId: chefId,
        fromRoleId: chefRole.id,
        toUserId: mgr.id,
        toRoleId: managerRole.id,
        message: msg,
      });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all order statuses
chefController.getOrderStatuses = async (req, res) => {
  try {
    const orderStatuses = await OrderStatus.findAll({
      attributes: ["id", "name", "createdAt", "updatedAt"],
      order: [["id", "ASC"]],
    });

    res.json(orderStatuses);
  } catch (e) {
    console.error("Error fetching order statuses:", e);
    res.status(500).json({
      message: "Error fetching order statuses",
      error: e.message,
    });
  }
};
chefController.updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    // Find the order and update its status
    const order = await db.orderProducts.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status
    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      status: "success",
    });
  } catch (e) {
    console.error("Error updating order status:", e);
    res.status(500).json({ message: "Server error", error: e.message });
  }
};

module.exports = chefController;
