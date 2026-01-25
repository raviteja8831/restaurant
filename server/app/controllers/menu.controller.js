// Get all menus with their items (both menu and menuItems filtered by status)
exports.getMenuWithItems = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const statusParam = req.params.status;

    const db = require("../models");

    // Build the query with where conditions
    const query = {
      where: {},
      include: [{
        model: db.menuItem,
        as: "menuItems",
        where: {},
        required: false // LEFT JOIN to include menus even if no items
      }],
    };

    // Add restaurantId filter if provided
    if (restaurantId) {
      query.where.restaurantId = Number(restaurantId);
    }

    // Add status condition for both menu and menuItems (only if not 'all')
    if (statusParam !== "all") {
      // Filter menus by status = true
      query.where.status = true;
      // Filter menuItems by status = true
      query.include[0].where.status = true;
    }

    const menus = await db.menu.findAll(query);
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const db = require("../models");
const Menu = db.menu;
exports.getItemsBasedOnMenu = async (req, res) => {
  try {
    const menuId = req.params.menuId;
    const items = await db.menuItem.findAll({
      where: { menuId: Number(menuId) },
    });
    const itemsWithSelected = items.map((item) => ({
      ...item.dataValues,
      selected: false,
    }));
    res.json(itemsWithSelected);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.create = async (req, res) => {
  try {
    const { name, restaurantId, status, icon } = req.body;

    // Validate required fields
    if (!name || !restaurantId) {
      return res.status(400).json({
        error: 'Menu name and restaurantId are required'
      });
    }

    // Check if a menu with the same name already exists for this restaurant
    const existingMenu = await Menu.findOne({
      where: {
        name: name,
        restaurantId: restaurantId
      }
    });

    if (existingMenu) {
      // Return the existing menu instead of creating a duplicate
      console.log(`Menu type "${name}" already exists for restaurant ${restaurantId}, returning existing menu with id ${existingMenu.id}`);
      return res.status(200).json({
        message: 'Menu type already exists, using existing menu',
        menu: existingMenu,
        isExisting: true
      });
    }

    // Create new menu if it doesn't exist
    const menu = await Menu.create(req.body);
    console.log(`Created new menu type "${name}" with id ${menu.id} for restaurant ${restaurantId}`);
    res.status(201).json({
      message: 'Menu type created successfully',
      menu: menu,
      isExisting: false
    });
  } catch (err) {
    console.error('Error in menu.create:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.findAll = async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.findOne = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (!menu) return res.status(404).json({ error: "Not found" });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await Menu.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Menu.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};