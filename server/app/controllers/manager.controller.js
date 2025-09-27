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
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required"+ req });
    }
    console.log("Fetching dashboard for restaurantId:", restaurantId);
    // Get manager (first manager for this restaurant)
    const manager = await db.restaurantUser.findOne({
      where: { restaurantId, role_id: 1 },
    });

    // Get restaurant
    const restaurant = await db.restaurant.findByPk(restaurantId);

    // Get today's date range
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(todayDate.getDate() + 1);

    // Orders today
    const ordersToday = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow },
      },
    });

    // Get chef login statistics
    const todayFormatted = formatIndianDateTime(todayDate).split(" ")[0]; // Get only the date part

    // 1. Total unique chefs who logged in today
    const totalUniqueLogins = await db.chefLogin.count({
      where: {
        restaurantId,
        loginTime: {
          [Op.like]: `${todayFormatted}%`,
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

    // 2. Currently logged in chefs (unique chefs with login time today but no logout time)
    const currentlyLoggedIn = await db.chefLogin.count({
      where: {
        restaurantId,
        loginTime: {
          [Op.like]: `${todayFormatted}%`,
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

    // 3. Number of unique chefs who logged out today
    const logoutsToday = await db.chefLogin.count({
      where: {
        restaurantId,
        logOutTime: {
          [Op.like]: `${todayFormatted}%`,
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

    // Tables served today (distinct tableId in orders)
    const tablesServed = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow },
      },
      distinct: true,
      col: "tableId",
    });

    // Customers today (distinct userId in orders)
    const customers = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow },
      },
      distinct: true,
      col: "userId",
    });

    // Transaction amount today
    const orders = await db.orders.findAll({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow },
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

    // Sales data and income data from orders (last 12 months)
    const { fn, col, literal } = db.Sequelize;
    // Get sales count and income sum grouped by month for last 12 months
    // MySQL: use DATE_FORMAT for grouping by month and year
    const salesIncomeRaw = await db.orders.findAll({
      where: { restaurantId },
      attributes: [
        [fn('DATE_FORMAT', col('createdAt'), '%m'), 'month'],
        [fn('DATE_FORMAT', col('createdAt'), '%Y'), 'year'],
        [fn('COUNT', col('id')), 'salesCount'],
        [fn('SUM', col('total')), 'incomeSum'],
      ],
      group: [literal('year'), literal('month')],
      order: [[literal('year'), 'DESC'], [literal('month'), 'DESC']],
      limit: 12,
      raw: true,
    });

    // Format to [{label: 'Jan', value: ...}] for both sales and income, sorted oldest to newest
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const salesData = [];
    const incomeData = [];
    salesIncomeRaw.reverse().forEach(row => {
      const monthIdx = parseInt(row.month, 10) - 1;
      const label = monthNames[monthIdx];
      salesData.push({ label, value: Number(row.salesCount) });
      incomeData.push({ label, value: Number(row.incomeSum) });
    });

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
