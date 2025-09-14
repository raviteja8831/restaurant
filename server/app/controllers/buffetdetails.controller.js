const db = require("../models");

// Buffet details for a restaurant (not orders)
exports.getBuffetDetails = async (req, res) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    // Fetch all buffets for this restaurant
    const buffets = await db.buffet.findAll({ where: { restaurantId } });
    if (!buffets || buffets.length === 0) {
      return res.status(404).json([]);
    }
    res.json(buffets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save/update buffet details for a restaurant
exports.saveBuffetDetails = async (req, res) => {
  try {
    // Get restaurantId and other buffet details from request body
    const { id, restaurantId, name, menu, type, price, status } = req.body;
    if (!restaurantId) {
      return res.status(400).json({ message: "restaurantId is required" });
    }
    let buffet;
    if (id) {
      // Update existing buffet
      buffet = await db.buffet.findByPk(id);
      if (buffet) {
        buffet.name = name;
        buffet.menu = menu;
        buffet.type = type;
        buffet.price = price;
        buffet.isActive = status;

        await buffet.save();
      } else {
        return res.status(404).json({ message: "Buffet not found" });
      }
    } else {
      // Create new buffet
      buffet = await db.buffet.create({
        restaurantId,
        name,
        menu: menu,
        type,
        price,
        isActive: true
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Enable or disable buffet status
exports.setBuffetStatus = async (req, res) => {
  try {
    const { id, isActive } = req.body;
    if (typeof isActive !== 'boolean' || !id) {
      return res.status(400).json({ message: "id and isActive(boolean) required" });
    }
    const buffet = await db.buffet.findByPk(id);
    if (!buffet) {
      return res.status(404).json({ message: "Buffet not found" });
    }
    buffet.isActive = isActive;
    await buffet.save();
    res.json({ success: true, isActive: buffet.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Enable or disable all buffets for a restaurant
exports.setAllBuffetsStatus = async (req, res) => {
  try {
    const { restaurantId, isActive } = req.body;
    if (typeof isActive !== 'boolean' || !restaurantId) {
      return res.status(400).json({ message: "restaurantId and isActive(boolean) required" });
    }
    const [updated] = await db.buffet.update(
      { isActive },
      { where: { restaurantId } }
    );
    res.json({ success: true, updatedCount: updated, isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
