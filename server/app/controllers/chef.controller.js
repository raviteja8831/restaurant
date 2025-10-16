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
    const chefId = parseInt(id, 10) || 2;
    console.log("Chef ID from params:", chefId, req.params);
    // Get menuitems allotted to chef
    const chef = await restaurantUser.findByPk(chefId, {
      include: [{ model: MenuItem, as: "allottedMenuItems" }],
    });
    console.log("Chef details with allotted items:", chef);
    const menuItemIds = chef.allottedMenuItems.map((item) => item.id);
    console.log("Menu Item IDs allotted to chef:", menuItemIds);
    // Get orders containing these menuitems
    let orders = [];
    if (menuItemIds.length > 0) {
      try {
        orders = await Order.findAll({
          include: [
            {
              model: db.orderProducts,
              as: "orderProducts",
              where: {
                menuitemId: { [Op.in]: menuItemIds },
                status: { [Op.ne]: 4 },
              },
              required: true,
              include: [
                {
                  model: MenuItem,
                  as: "menuitem", // Use the correct alias as defined in your association
                },
              ],
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: 10,
        });
      } catch (err) {
        console.error("Order query failed:", err);
        return res
          .status(500)
          .json({ message: "Order query failed", error: err.message });
      }
    }
    console.log("Recent orders fetched:", orders);
    const totalOrders = await Order.count({
      include: [
        {
          model: db.orderProducts,
          as: "orderProducts",
          where: { menuitemId: { [Op.in]: menuItemIds } },
          required: true,
        },
      ],
    });
    console.log(totalOrders, "total");
    // const workingDays = await Order.count({
    //   include: [{
    //     model: db.orderProducts,
    //     as: 'orderProducts',
    //     where: { menuitemId: { [Op.in]: menuItemIds } },
    //     required: true
    //   }],
    //   distinct: true,
    //   col: Sequelize.fn('DATE', Sequelize.col('Order.createdAt'))
    // });
    const workingDays = 10;
    console.log("Orders fetched:", workingDays);
    // Most ordered dish
    const mostOrdered = await db.orderProducts.findAll({
      where: { menuitemId: { [Op.in]: menuItemIds } },
      attributes: [
        "menuitemId",
        [Sequelize.fn("COUNT", Sequelize.col("menuitemId")), "count"],
      ],
      group: ["menuitemId", "menuitem.id"],
      order: [[Sequelize.literal("count"), "DESC"]],
      limit: 5,
      include: [
        {
          model: MenuItem,
          as: "menuitem",
        },
      ],
    });
    console.log("Most ordered item:", mostOrdered);

    // Get today's date as a string in Indian format
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayFormatted = formatIndianDateTime(todayStart).split(" ")[0]; // Get only the date part

    // Find today's login record
    const loginRecord = await db.chefLogin.findOne({
      where: {
        chefId: chefId,
        loginTime: {
          [Op.like]: `${todayFormatted}%`, // Match any login time from today
        },
      },
      order: [["loginTime", "DESC"]],
    });

    let loginHours = 0;
    let loginTime = null;
    let logoutTime = null;

    if (loginRecord) {
      // Extract time from the stored formatted string
      loginTime = loginRecord.loginTime.split(" ").slice(1).join(" "); // Get only the time part

      // Convert Indian format date time to Date object
      const [datePart, timePart, period] = loginRecord.loginTime.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hours, minutes, seconds] = timePart.split(":");
      let hour = parseInt(hours);
      if (period.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;

      const startTime = new Date(
        year,
        month - 1,
        day,
        hour,
        parseInt(minutes),
        parseInt(seconds)
      );
      const endTime = loginRecord.logOutTime
        ? new Date(loginRecord.createdAt)
        : new Date();

      loginHours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2); // Convert to hours with 2 decimal places

      if (loginRecord.logOutTime) {
        // Extract time from logout time string if it exists
        logoutTime = loginRecord.logOutTime.split(" ").slice(1).join(" ");
      }
    }

    res.json({
      orders,
      totalOrders,
      workingDays,
      menuItems: chef.allottedMenuItems,
      mostOrdered,
      todayStats: {
        loginTime,
        logoutTime,
        loginHours: parseFloat(loginHours),
        isCurrentlyLoggedIn: loginRecord && !loginRecord.logOutTime,
        // loginRecord: loginRecord,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
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
            fromRoleId: chefRole.id,
            toRoleId: managerRole.id,
          },
          {
            toUserId: chefId,
            toRoleId: chefRole.id,
            fromRoleId: managerRole.id,
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    res.json({ messages: messagesList });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
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
