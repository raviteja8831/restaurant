const db = require('../models');
const MenuItem = db.menuItem;
const Menu = db.menu; // Add this line to define the menu model

exports.create = async (req, res) => {
  try {
   
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const items = await MenuItem.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await MenuItem.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await MenuItem.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Bulk status update for menu items (supports both /status-bulk and /updateStatus route)
exports.updateStatusBulk = async (req, res) => {
  try {
    let menuitemIds, status;
    if (Array.isArray(req.body)) {
      // If payload is just an array, default status to true
      menuitemIds = req.body;
      status = true;
    } else {
      let { menuitemIds: ids1, menuItemIds: ids2, status: s } = req.body;
      menuitemIds = ids1 || ids2;
      status = s;
    }
    if (!Array.isArray(menuitemIds) || typeof status === 'undefined') {
      return res.status(400).json({ error: 'menuitemIds (array) and status (boolean) are required' });
    }
    menuitemIds = menuitemIds.map(id => Number(id)).filter(id => !isNaN(id));
    if (!menuitemIds.length) {
      return res.status(400).json({ error: 'No valid menuitemIds provided' });
    }
    const [updated] = await MenuItem.update(
      { status },
      { where: { id: menuitemIds } }
    );
    res.json({ message: `Updated ${updated} menu items` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get distinct types for a restaurant
exports.getDistinctTypes = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID is required' });
    }

    // Get all menu items for this restaurant through menus
    const types = await db.sequelize.query(
      `SELECT DISTINCT mi.type
       FROM menuitem mi
       INNER JOIN menu m ON mi.menuId = m.id
       WHERE m.restaurantId = :restaurantId
       AND mi.type IS NOT NULL
       AND mi.type != ''
       ORDER BY mi.type`,
      {
        replacements: { restaurantId: Number(restaurantId) },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Extract just the type values
    const typeList = types.map(t => t.type);
    res.json(typeList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
