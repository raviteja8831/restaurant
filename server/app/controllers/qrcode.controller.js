

const db = require('../models');
const QRCode = require('qrcode');

// Helper to generate QR code image as Data URL
async function generateQRCodeDataUrl(value) {
  return await QRCode.toDataURL(value, { width: 200 });
}

// List all QR codes for a restaurant
exports.listQRCodes = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) return res.status(400).json({ message: 'restaurantId required' });
    const tables = await db.restaurantTable.findAll({
      where: { restaurantId },
      attributes: ['id', 'name', 'qrcode', 'status', 'restaurantId'],
      order: [['id', 'ASC']]
    });
 
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new QR code (table)
exports.createQRCode = async (req, res) => {
  try {
    const { name, restaurantId } = req.body;
    if (!name || !restaurantId) return res.status(400).json({ message: 'Missing fields' });
    // Check if restaurant exists
    const restaurant = await db.restaurant.findByPk(restaurantId);
    if (!restaurant) return res.status(400).json({ message: 'Invalid restaurantId' });
    // Generate QR code image
    const value = `${restaurantId}_${name}`;
    const qrcodeDataUrl = await generateQRCodeDataUrl(value);
    // Create table with QR code
    const table = await db.restaurantTable.create({
      name,
      restaurantId,
      qrcode: qrcodeDataUrl,
      status: 'free'
    });
    res.json({
      id: table.id,
      restaurantId: table.restaurantId,
      name: table.name,
      status: table.status,
      imageUrl: table.qrcode
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List orders for a QR code (table)
exports.getQRCodeOrders = async (req, res) => {
  try {
    const { qrcodeId } = req.params;
    const { period } = req.query;
    const { Op } = db.Sequelize;
    let dateFilter = {};
    if (period === 'today') {
      const start = new Date();
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      dateFilter = { createdAt: { [Op.between]: [start, end] } };
    } else if (period === 'week') {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      dateFilter = { createdAt: { [Op.between]: [start, end] } };
    } else if (period === 'month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      dateFilter = { createdAt: { [Op.between]: [start, end] } };
    }
    const orders = await db.orders.findAll({
      where: { tableId: qrcodeId, ...dateFilter },
      attributes: ['id', 'userId', 'total', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      include: [{
        model: db.users,
        as: 'users',
        attributes: ['firstname', 'lastname', 'phone']
      }]
    });
    res.json(orders.map(o => ({
      id: o.id,
      name: o.users ? `${o.users.firstname} ${o.users.lastname}` : '',
      contact: o.users ? o.users.phone : '',
      time: o.createdAt,
      amount: o.total,
      status: o.status
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
