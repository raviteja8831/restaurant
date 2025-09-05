const db = require('../models');
const MenuItem = db.menuItem;
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
    // Accept both menuitemIds and menuItemIds for compatibility
    let { menuitemIds, menuItemIds, status } = req.body;
    menuitemIds = menuitemIds || menuItemIds;
    if (!Array.isArray(menuitemIds) || typeof status === 'undefined') {
      return res.status(400).json({ error: 'menuitemIds (array) and status (boolean) are required' });
    }
    // Ensure all IDs are numbers (MySQL strict mode fix)
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
