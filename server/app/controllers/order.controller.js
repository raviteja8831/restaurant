const db = require("../models");
const Order = db.orders;
const User = db.users;
const Role = db.roles;
const OrderProduct = db.orderProducts_;
const MenuItem = db.menuItem;
const Restaurant = db.restaurant;

exports.createOrder = async (req, res) => {
  try {
    // Check if orderID exists in request body for update
    if (req.body.orderID) {
      // Changed from orderId to orderID
      // Update existing order
      const existingOrder = await Order.findByPk(req.body.orderID); // Changed from orderId to orderID
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }
      await existingOrder.update(req.body);

      // Handle order items updates and creation
      if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
        for (const item of req.body.orderItems) {
          if (item.orderItemId) {
            // Update existing order item
            await OrderProduct.update(
              { quantity: item.quantity },
              { where: { id: item.orderItemId, orderId: req.body.orderID } } // Changed from orderId to orderID
            );
          } else {
            // Create new order item
            await OrderProduct.create({
              orderId: req.body.orderID, // Changed from orderId to orderID
              menuItemId: item.id,
              quantity: item.quantity,
            });
          }
        }
      }

      // Handle item removal if removedItems exists
      if (req.body.removedItems && Array.isArray(req.body.removedItems)) {
        const validIds = req.body.removedItems
          .filter((item) => item.orderItemId)
          .map((item) => item.orderItemId);
        if (validIds.length > 0) {
          await OrderProduct.destroy({
            where: {
              id: validIds,
              orderId: req.body.orderID, // Changed from orderId to orderID
            },
          });
        }
      }

      return res.status(200).json(existingOrder);
    } else {
      // Create new order if no orderID provided
      const order = await Order.create(req.body);

      // Check if order items exist in the request body
      if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
        // Create order products for each item
        const orderProducts_ = req.body.orderItems.map((item) => ({
          orderId: order.id,
          menuItemId: item.id,
          quantity: item.quantity,
        }));

        // Bulk create all order products
        await OrderProduct.bulkCreate(orderProducts_);
      }
      res.status(201).json(order);
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message, from: " Error creating order." });
  }
};

// Get pending orders with item count and total for a restaurant
exports.getPendingOrders = async (req, res) => {
  try {
    const { restaurantId, userId } = req.params;

    const [pendingOrders, totalStats] = await Promise.all([
      Order.findAll({
        where: {
          restaurantId: restaurantId,
          userId: userId,
          status: "PENDING",
        },
        attributes: ["id"],
      }),
      db.sequelize.query(
        `
        SELECT 
          COUNT(DISTINCT op.id) as totalOrders,
          COALESCE(SUM(op.quantity * mi.price), 0) as totalOrdersAmount
        FROM \`order\` o
        LEFT JOIN OrdersProduct op ON o.id = op.orderId
        LEFT JOIN menuitem mi ON op.menuItemId = mi.id
        WHERE o.restaurantId = :restaurantId 
        AND o.userId = :userId
        AND o.status = 'PENDING'
      `,
        {
          replacements: { restaurantId, userId },
          type: db.sequelize.QueryTypes.SELECT,
        }
      ),
    ]);

    const stats = totalStats[0] || { totalOrders: 0, totalOrdersAmount: 0 };
    const response = {
      orderId: pendingOrders[0]?.id || null,
      totalOrders: stats.totalOrders.toString(),
      totalOrdersAmount: stats.totalOrdersAmount,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in getPendingOrders:", err);
    res.status(500).json({
      status: "error",
      message: "Error fetching pending orders",
      error: err.message,
    });
  }
};
// Get items for a selected order
exports.getSelectedOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderItems = await OrderProduct.findAll({
      where: { orderId: orderId },
    });
    res.status(200).json(orderItems);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error fetching selected order items",
      error: err.message,
    });
  }
};
