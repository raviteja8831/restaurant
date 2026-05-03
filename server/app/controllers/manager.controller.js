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

    // Date range logic — all boundaries in IST (UTC+5:30)
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    let startDate, endDate;
    const now = new Date();
    // IST "today" midnight expressed as UTC
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);
    const istTodayMidnightUTC = new Date(
      Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate())
    ) - IST_OFFSET_MS; // back to UTC
    switch (dateFilter) {
      case "week":
        // Last 7 days: from IST midnight 6 days ago through end of IST today
        startDate = new Date(istTodayMidnightUTC - 6 * 24 * 60 * 60 * 1000);
        endDate   = new Date(istTodayMidnightUTC + 24 * 60 * 60 * 1000 - 1);
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
        // Entire current calendar day (00:00:00 to 23:59:59)
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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
  // Pre-fetch all chef IDs (role_id=2) for this restaurant to avoid include+count Sequelize issues
  const chefUsers = await db.restaurantUser.findAll({
    where: { restaurantId, role_id: 2 },
    attributes: ['id'],
    raw: true,
  });
  const chefUserIds = chefUsers.map(u => u.id);

    // 1. Total login sessions (events) in date range - count all records for chef users
    const totalLoginSessions = chefUserIds.length === 0 ? 0 : await db.chefLogin.count({
      where: {
        restaurantId,
        chefId: { [Op.in]: chefUserIds },
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });

    // 2. Currently logged in chefs (active session = logOutTime is null), distinct by chefId
    const currentlyLoggedIn = chefUserIds.length === 0 ? 0 : await db.chefLogin.count({
      where: {
        restaurantId,
        chefId: { [Op.in]: chefUserIds },
        logOutTime: null,
      },
      distinct: true,
      col: "chefId",
    });

    // 3. Chefs who logged out in the date range
    const loggedOutChefIds = chefUserIds.length === 0 ? [] : await db.chefLogin.findAll({
      where: {
        restaurantId,
        chefId: { [Op.in]: chefUserIds },
        logOutTime: { [Op.ne]: null },
        updatedAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
      attributes: ['chefId'],
      group: ['chefId'],
      raw: true,
    });

    // Get chefs with active sessions (logOutTime = null)
    const activeChefIds = chefUserIds.length === 0 ? [] : await db.chefLogin.findAll({
      where: {
        restaurantId,
        chefId: { [Op.in]: chefUserIds },
        logOutTime: null,
      },
      attributes: ['chefId'],
      group: ['chefId'],
      raw: true,
    });

    // Filter out active chefs from logged out chefs
    const activeChefIdsSet = new Set(activeChefIds.map(c => c.chefId));
    const loggedOutNotActive = loggedOutChefIds.filter(c => !activeChefIdsSet.has(c.chefId));
    const loggedOutNotActiveCount = loggedOutNotActive.length;

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
      // Group by IST date (YYYY-MM-DD) to avoid UTC/IST timezone shift mis-attribution
      salesIncomeRaw = await db.orders.findAll({
        where: {
          restaurantId,
          createdAt: { [Op.gte]: startDate, [Op.lte]: endDate },
        },
        attributes: [
          [fn('DATE', fn('CONVERT_TZ', col('createdAt'), '+00:00', '+05:30')), 'istDate'],
          [fn('COUNT', col('id')), 'salesCount'],
          [fn('SUM', col('total')), 'incomeSum'],
        ],
        group: [literal('istDate')],
        order: [[literal('istDate'), 'ASC']],
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
      // All 24 hours of the current day
      for (let i = 0; i < 24; i++) {
        const found = salesIncomeRaw.find(r => Number(r.hour) === i);
        salesData.push({ label: `${i}:00`, value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: `${i}:00`, value: found ? Number(found.incomeSum) : 0 });
      }
    } else if (dateFilter === "week") {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      // Build labels for the last 7 IST days, oldest first, today last
      for (let i = 6; i >= 0; i--) {
        const dayUTC = new Date(istTodayMidnightUTC - i * 24 * 60 * 60 * 1000);
        // Convert back to IST to get the correct calendar date string (YYYY-MM-DD)
        const istDay = new Date(dayUTC.getTime() + IST_OFFSET_MS);
        const yyyy = istDay.getUTCFullYear();
        const mm   = String(istDay.getUTCMonth() + 1).padStart(2, '0');
        const dd   = String(istDay.getUTCDate()).padStart(2, '0');
        const istDateStr = `${yyyy}-${mm}-${dd}`;
        const label = dayNames[istDay.getUTCDay()];
        const found = salesIncomeRaw.find(r => r.istDate === istDateStr);
        salesData.push({ label, value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label, value: found ? Number(found.incomeSum) : 0 });
      }
    } else if (dateFilter === "month") {
      // Show fewer labels for better readability: 1, 5, 10, 15, 20, 25, 30
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const displayDays = [1, 5, 10, 15, 20, 25];
      if (daysInMonth === 31) {
        displayDays.push(30);
      } else if (daysInMonth >= 28) {
        displayDays.push(daysInMonth);
      }

      displayDays.forEach(d => {
        const found = salesIncomeRaw.find(r => Number(r.day) === d);
        salesData.push({ label: `${d}`, value: found ? Number(found.salesCount) : 0 });
        incomeData.push({ label: `${d}`, value: found ? Number(found.incomeSum) : 0 });
      });
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
      // Chef login statistics
      chefLogins: totalLoginSessions, // Total login sessions/events in date range
      currentlyLoggedIn: currentlyLoggedIn, // Chefs currently logged in (active sessions)
      chefLogouts: loggedOutNotActiveCount, // Chefs who logged out but haven't logged back in
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
      { status: 'SERVED' }, // Status SERVED = Served/Completed
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

// Get detailed chef login/logout activity report
exports.getChefActivityReport = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate, chefId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }

    // Build where clause for chefLogin
    const whereClause = { restaurantId };

    // If specific chef is requested
    if (chefId) {
      whereClause.chefId = chefId;
    }

    // Date filtering
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        [Op.gte]: start,
        [Op.lte]: end
      };
    } else {
      // Default to today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        [Op.gte]: todayStart,
        [Op.lte]: todayEnd
      };
    }

    // Fetch chef login records with chef details
    const chefActivities = await db.chefLogin.findAll({
      where: whereClause,
      include: [
        {
          model: db.restaurantUser,
          as: 'chef',
          attributes: ['id', 'firstname', 'lastname', 'phone'],
          include: [
            {
              model: db.roles,
              as: 'role',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate working hours for each session
    const calculateWorkingHours = (loginTime, logoutTime) => {
      if (!loginTime) return 0;

      try {
        // Parse Indian format date time: "DD/MM/YYYY HH:MM:SS am/pm" as IST
        const parseIndianDateTime = (dateTimeStr) => {
          const parts = dateTimeStr.trim().split(' ');
          if (parts.length < 3) return null;

          const [datePart, timePart, period] = parts;
          const [day, month, year] = datePart.split('/');
          const [hours, minutes, seconds] = timePart.split(':');

          let hour = parseInt(hours);
          if (period && period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
          if (period && period.toLowerCase() === 'am' && hour === 12) hour = 0;

          // Build as UTC then subtract IST offset (5h30m) so the result is correct UTC
          const istOffsetMs = 5.5 * 60 * 60 * 1000;
          const utcMs = Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds || 0));
          return new Date(utcMs - istOffsetMs);
        };

        const startTime = parseIndianDateTime(loginTime);
        if (!startTime) return 0;

        const endTime = logoutTime ? parseIndianDateTime(logoutTime) : new Date();

        const diffMs = endTime - startTime;
        const diffHours = diffMs / (1000 * 60 * 60);

        return Math.max(0, diffHours).toFixed(2);
      } catch (error) {
        console.error('Error calculating working hours:', error);
        return 0;
      }
    };

    // Format the response
    const formattedActivities = chefActivities.map(activity => ({
      id: activity.id,
      chefId: activity.chefId,
      chefName: `${activity.chef?.firstname || ''} ${activity.chef?.lastname || ''}`.trim() || 'Unknown Chef',
      chefPhone: activity.chef?.phone || 'N/A',
      loginTime: activity.loginTime,
      logoutTime: activity.logOutTime || 'Still Active',
      workingHours: parseFloat(calculateWorkingHours(activity.loginTime, activity.logOutTime)),
      status: activity.logOutTime ? 'Logged Out' : 'Active',
      createdAt: activity.createdAt
    }));

    // Calculate summary statistics
    const totalSessions = formattedActivities.length;
    const activeSessions = formattedActivities.filter(a => a.status === 'Active').length;
    const completedSessions = formattedActivities.filter(a => a.status === 'Logged Out').length;
    const totalWorkingHours = formattedActivities.reduce((sum, a) => sum + a.workingHours, 0).toFixed(2);

    res.json({
      status: 'success',
      summary: {
        totalSessions,
        activeSessions,
        completedSessions,
        totalWorkingHours: parseFloat(totalWorkingHours)
      },
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching chef activity report:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching chef activity report',
      error: error.message
    });
  }
};
