// Manager Dashboard Controller
const db = require("../models");
const { Op } = require("sequelize");

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

exports.dashboard = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId || req.query.restaurantId;
    const dateFilter = req.query.dateFilter || "day";
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required"+ req });
    }
    console.log("Fetching dashboard for restaurantId:", restaurantId, "dateFilter:", dateFilter);

    // Date range logic
    let startDate, endDate;
    const now = new Date();
    switch (dateFilter) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "day":
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    // Get manager (first manager for this restaurant)
    const manager = await db.restaurantUser.findOne({
      where: { restaurantId, role_id: 1 },
    });

    // Get restaurant
    const restaurant = await db.restaurant.findByPk(restaurantId);

    // Orders in range
    const ordersToday = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
    });

  // Get chef login statistics
  const todayFormatted = formatIndianDateTime(startDate).split(" ")[0]; // Get only the date part

    // 1. Total unique chefs who logged in in range
    const totalUniqueLogins = await db.chefLogin.count({
      where: {
        restaurantId,
        loginTime: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      distinct: true,
      col: "chefId",
      include: [
        {
          model: db.restaurantUser,
          as: "chef",
          where: {
            role_id: "2", // Chef role
          },
          required: true,
        },
      ],
    });

    // 2. Currently logged in chefs (unique chefs with login time in range but no logout time)
    const currentlyLoggedIn = await db.chefLogin.count({
      where: {
        restaurantId,
        loginTime: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
        logOutTime: null,
      },
      include: [
        {
          model: db.restaurantUser,
          as: "chef",
          where: {
            role_id: 2,
          },
          required: true,
        },
      ],
      distinct: true,
      col: "chefId",
    });

    // 3. Number of unique chefs who logged out in range
    const logoutsToday = await db.chefLogin.count({
      where: {
        restaurantId,
        logOutTime: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      include: [
        {
          model: db.restaurantUser,
          as: "chef",
          where: {
            role_id: "2",
          },
          required: true,
        },
      ],
      distinct: true,
      col: "chefId",
    });

    // Tables served in range (distinct tableId in orders)
    const tablesServed = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      distinct: true,
      col: "tableId",
    });

    // Customers in range (distinct userId in orders)
    const customers = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      distinct: true,
      col: "userId",
    });

    // Transaction amount in range
    const orders = await db.orders.findAll({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
      },
      attributes: ["total"],
    });
    const transactionAmt = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Table status
    const reservedTables = await db.restaurantTable.count({
      where: { restaurantId, status: "reserved" },
    });
    const nonReservedTables = await db.restaurantTable.count({
      where: { restaurantId, status: { [Op.ne]: "reserved" } },
    });

    // Buffet info (mocked, or fetch from restaurant if you have buffet fields)
    const buffetName = "Breakfast Buffet";
    const buffetItems = "Poori, All types of Dosa, Chow Chow Bath, Rice Bath";
    const buffetPrice = "800 Rs";

    // Sales data and income data from orders (filtered by dateFilter)
    const { fn, col, literal } = db.Sequelize;
    let salesIncomeRaw = [];
    if (dateFilter === "day") {
      // Group by hour for the day
      salesIncomeRaw = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
        },
        attributes: [
          [fn('HOUR', col('createdAt')), 'hour'],
          [fn('COUNT', col('id')), 'salesCount'],
          [fn('SUM', col('total')), 'incomeSum'],
        ],
        group: [literal('hour')],
        order: [[literal('hour'), 'ASC']],
        raw: true,
      });
    } else if (dateFilter === "week") {
      // Group by day of week
      salesIncomeRaw = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
        },
        attributes: [
          [fn('DAYNAME', col('createdAt')), 'day'],
          [fn('COUNT', col('id')), 'salesCount'],
          [fn('SUM', col('total')), 'incomeSum'],
        ],
        group: [literal('day')],
        order: [[literal('day'), 'ASC']],
        raw: true,
      });
    } else if (dateFilter === "month") {
      // Group by day of month
      salesIncomeRaw = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
        },
        attributes: [
          [fn('DAY', col('createdAt')), 'day'],
          [fn('COUNT', col('id')), 'salesCount'],
          [fn('SUM', col('total')), 'incomeSum'],
        ],
        group: [literal('day')],
        order: [[literal('day'), 'ASC']],
        raw: true,
      });
    } else if (dateFilter === "year") {
      // Group by month
      salesIncomeRaw = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
        },
        attributes: [
          [fn('MONTH', col('createdAt')), 'month'],
          [fn('COUNT', col('id')), 'salesCount'],
          [fn('SUM', col('total')), 'incomeSum'],
        ],
        group: [literal('month')],
        order: [[literal('month'), 'ASC']],
        raw: true,
      });
    }

    // Format chart data for frontend
    let salesData = [];
    let incomeData = [];
    if (dateFilter === "day") {
      // 0-23 hours
      for (let h = 0; h < 24; h++) {
        const found = salesIncomeRaw.find(r => Number(r.hour) === h);
        salesData.push({ label: `${h}:00`, value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: `${h}:00`, value: found ? Number(found.incomeSum) : 0 });
      }
    } else if (dateFilter === "week") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      days.forEach(day => {
        const found = salesIncomeRaw.find(r => r.day === day);
        salesData.push({ label: day.slice(0, 3), value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: day.slice(0, 3), value: found ? Number(found.incomeSum) : 0 });
      });
    } else if (dateFilter === "month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const found = salesIncomeRaw.find(r => Number(r.day) === d);
        salesData.push({ label: `${d}`, value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: `${d}`, value: found ? Number(found.incomeSum) : 0 });
      }
    } else if (dateFilter === "year") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      for (let m = 1; m <= 12; m++) {
        const found = salesIncomeRaw.find(r => Number(r.month) === m);
        salesData.push({ label: monthNames[m - 1], value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: monthNames[m - 1], value: found ? Number(found.incomeSum) : 0 });
      }
    }

    // Date formatting
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = days[new Date().getDay()];
    const date = new Date().toLocaleDateString("en-GB");

    res.json({
      managerName: manager ? manager.firstname : "Manager",
      managerPhone: manager ? manager.phone : "",
      restaurantName: restaurant ? restaurant.name : "Hotel",
      today,
      date,
      orders: ordersToday,
      tablesServed,
      customers,
      transactionAmt: transactionAmt.toLocaleString(),
      reservedTables,
      nonReservedTables,
      buffetName,
      buffetItems,
      buffetPrice,
      salesData,
      incomeData,
      // Real chef login statistics
      chefLogins: totalUniqueLogins, // Total number of unique chefs who logged in today
      currentlyLoggedIn: currentlyLoggedIn, // Number of chefs currently logged in
      chefLogouts: logoutsToday, // Number of chef logouts today
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get paid orders that need to be cleared
exports.getPaidOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    // Get paid orders (status = 'PAID') that are not yet completed
    const orders = await db.orders.findAll({
      where: {
        restaurantId,
        status: 'PAID', // Orders that have been paid but not cleared
      },
      include: [
        {
          model: db.users,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
        },
        {
          model: db.orderProducts,
          as: 'orderProducts',
          include: [
            {
              model: db.menuItem,
              as: 'menuitem',
              attributes: ['name', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the response to match frontend expectations
    const formattedOrders = orders.map(order => ({
      id: order.id,
      totalAmount: order.total,
      createdAt: order.createdAt,
      tableId: order.tableId,
      customer: order.customer,
      orderItems: order.orderProducts?.map(item => ({
        menuItemName: item.menuitem?.name || 'Unknown Item',
        quantity: item.quantity,
        price: item.menuitem?.price || 0
      })) || []
    }));

    res.json({
      status: 'success',
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching paid orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching paid orders',
      error: error.message
    });
  }
};

// Clear an order (mark as completed after payment verification)
exports.clearOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, clearedBy } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    // Find the order
    const order = await db.orders.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== 'PAID') {
      return res.status(400).json({ message: "Order is not in paid status" });
    }

    // Update order status to completed
    await order.update({
      status: 'COMPLETED',
      clearedAt: new Date(),
      clearedBy: clearedBy || 'MANAGER'
    });

    // Also update all associated order products to served/completed status
    await db.orderProducts.update(
      { status: 4 }, // Status 4 = Served/Completed
      {
        where: { orderId: orderId }
      }
    );

    res.json({
      status: 'success',
      message: 'Order cleared successfully',
      order: {
        id: order.id,
        status: order.status,
        clearedAt: order.clearedAt
      }
    });

  } catch (error) {
    console.error('Error clearing order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error clearing order',
      error: error.message
    });
  }
};
