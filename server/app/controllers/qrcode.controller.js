

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
      attributes: ['id', 'name', 'qrcode', 'status'],
      order: [['id', 'ASC']]
    });
    // If qrcode is not a data URL, generate it on the fly
    const result = await Promise.all(tables.map(async t => {
      let imageUrl = t.qrcode;
      if (!imageUrl || !imageUrl.startsWith('data:image')) {
        imageUrl = await generateQRCodeDataUrl(`${t.restaurantId}_${t.name}`);
      }
      return {
        id: t.id,
        tableId: t.id,
        restaurantId: t.restaurantId,
        name: t.name,
        imageUrl,
        status: t.status
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new QR code (table)
exports.createQRCode = async (req, res) => {
  try {
    const { name, restaurantId } = req.body;
    if (!name || !restaurantId) return res.status(400).json({ message: 'Missing fields' });
    const value = `${restaurantId}_${name}`;
    const imageUrl = await generateQRCodeDataUrl(value);
    // Create table with QR code
    const table = await db.restaurantTable.create({
      name,
      restaurantId,
      qrcode: imageUrl,
      status: 'free'
    });
    res.json({
      id: table.id,
      tableId: table.id,
      restaurantId: table.restaurantId,
      name: table.name,
      imageUrl: table.qrcode,
      status: table.status
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
