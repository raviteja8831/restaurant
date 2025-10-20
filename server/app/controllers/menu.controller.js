// Get all menus with their items
exports.getMenuWithItems = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const db = require("../models");

    const query = {
      include: [{
        model: db.menuItem,
        as: "menuItems",
        include: [{
          model: db.restaurantUser,
          as: "allottedUsers",
          through: {
            model: db.userMenuItem,
            attributes: []
          },
          required: false,
          attributes: []
        }]
      }],
    };

    if (restaurantId) {
      query.where = { restaurantId: Number(restaurantId) };
    }

    const menus = await db.menu.findAll(query);

    // Filter menus to only include those with at least one menu item allocated to a chef
    const filteredMenus = menus
      .map(menu => {
        // Filter menu items to only include those with allocations in user_menuitem
        const allocatedItems = menu.menuItems.filter(item =>
          item.allottedUsers && item.allottedUsers.length > 0
        );

        // Return menu only if it has allocated items
        if (allocatedItems.length > 0) {
          return {
            ...menu.toJSON(),
            menuItems: allocatedItems
          };
        }
        return null;
      })
      .filter(menu => menu !== null);

    res.json(filteredMenus);
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
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (err) {
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
