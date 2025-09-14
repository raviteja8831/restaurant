// Manager Dashboard Controller
const db = require('../models');
const { Op } = require('sequelize');

exports.dashboard = async (req, res) => {
  try {
  // Use restaurantId from request (query or body)
  const restaurantId = req.query.restaurantId || req.body.restaurantId || 1;

    // Get manager (first manager for this restaurant)
    const manager = await db.restaurantUser.findOne({
      where: { restaurantId, role_id: 1 },
    });

    // Get restaurant
    const restaurant = await db.restaurant.findByPk(restaurantId);

    // Orders today
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);
    const tomorrow = new Date(todayDate);
    tomorrow.setDate(todayDate.getDate() + 1);
    const ordersToday = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow }
      }
    });

    // Tables served today (distinct tableId in orders)
    const tablesServed = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow }
      },
      distinct: true,
      col: 'tableId'
    });

    // Customers today (distinct userId in orders)
    const customers = await db.orders.count({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow }
      },
      distinct: true,
      col: 'userId'
    });

    // Transaction amount today
    const orders = await db.orders.findAll({
      where: {
        restaurantId,
        createdAt: { [Op.gte]: todayDate, [Op.lt]: tomorrow }
      },
      attributes: ['total']
    });
    const transactionAmt = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Table status
    const reservedTables = await db.restaurantTable.count({ where: { restaurantId, status: 'reserved' } });
    const nonReservedTables = await db.restaurantTable.count({ where: { restaurantId, status: { [Op.ne]: 'reserved' } } });

    // Buffet info (mocked, or fetch from restaurant if you have buffet fields)
    const buffetName = 'Breakfast Buffet';
    const buffetItems = 'Poori, All types of Dosa, Chow Chow Bath, Rice Bath';
    const buffetPrice = '800 Rs';

    // Sales data (mocked, or aggregate from orders)
    const salesData = [
      { label: 'Oct', value: 20 },
      { label: 'Nov', value: 45 },
      { label: 'Dec', value: 28 },
      { label: 'Jan', value: 80 },
      { label: 'Feb', value: 99 },
      { label: 'Mar', value: 43 },
      { label: 'Apr', value: 50 },
      { label: 'May', value: 60 },
      { label: 'Jun', value: 70 }
    ];
    // Income data (mocked, or aggregate from orders)
    const incomeData = [
      { label: 'Feb', value: 10 },
      { label: 'Mar', value: 20 },
      { label: 'Apr', value: 15 },
      { label: 'May', value: 30 },
      { label: 'Jun', value: 40 },
      { label: 'Jul', value: 50 },
      { label: 'Aug', value: 60 },
      { label: 'Sep', value: 55 },
      { label: 'Oct', value: 65 }
    ];

    // Chef logins/logouts (mocked, implement real logic if you track logins)
    const chefLogins = 6;
    const chefLogouts = 0;

    // Date formatting
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const date = new Date().toLocaleDateString('en-GB');

    res.json({
      managerName: manager ? manager.firstname : 'Manager',
      managerPhone: manager ? manager.phone : '',
      restaurantName: restaurant ? restaurant.name : 'Hotel',
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
      chefLogins,
      chefLogouts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
