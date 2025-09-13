const db = require("../models");
const Order = db.orders;
const User = db.users;
const Role = db.roles;
const OrderProduct = db.orderProducts;
const MenuItem = db.menuItem;
const Restaurant = db.restaurant;

// Delete order and its items
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    // First, delete all associated order items
    await OrderProduct.destroy({
      where: { orderId: orderId },
    });

    // Then delete the order itself
    const deletedOrder = await Order.destroy({
      where: { id: orderId },
    });

    if (deletedOrder === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Order and associated items deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting order",
      error: error.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    // Check if orderID exists in request body for update
    if (req.body.orderID) {
      // Changed from orderId to orderID
      // Update existing order
      const existingOrder = await Order.findByPk(req.body.orderID); // Changed from orderId to orderID
      if (!existingOrder) {
        /*  const order = await Order.create(req.body);

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
        } */
        res.status(201).json("");
        return;
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
      // Get count of remaining order products
      const remainingProducts = await OrderProduct.count({
        where: { orderId: req.body.orderID },
      });

      // If no products remain, delete the order
      if (remainingProducts === 0) {
        await existingOrder.destroy();
        return res
          .status(200)
          .json({ message: "Order deleted as no items remain" });
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

    // Get order details
    const order = await Order.findOne({
      where: { id: orderId },
      attributes: [
        "id",
        "status",
        "restaurantId",
        "userId",
        "total",
        "createdAt",
      ],
      include: [
        {
          model: Restaurant,
          as: "orderRestaurant",
          attributes: ["name"],
        },
      ],
    });

    if (!order) {
      return res.status(200).json({
        order_details: {},
        orderItems: [],
      });
    }

    // Get order items
    const orderItems = await OrderProduct.findAll({
      where: { orderId },
      include: [
        {
          model: MenuItem,
          as: "menuitem",
          attributes: ["id", "name", "price"],
        },
      ],
      raw: true,
      nest: true,
    });

    const formatted = orderItems.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      menuItemName: item.menuitem.name,
      price: item.menuitem.price,
      quantity: item.quantity,
      status: order.status,
    }));

    // Combine order details and items
    const responseObj = {
      order_details: {
        id: order.id,
        status: order.status,
        restaurantId: order.restaurantId,
        restaurantName: order.orderRestaurant?.name,
        userId: order.userId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
      orderItems: formatted,
    };

    res.status(200).json(responseObj);
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error fetching selected order items",
      error: err.message,
    });
  }
};
// Update order status and order products
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, totalAmount, updatedItems, removedItems } = req.body;

    // Start a transaction
    const result = await db.sequelize.transaction(async (t) => {
      // Update quantities for updated items first
      if (updatedItems && updatedItems.length > 0) {
        for (const item of updatedItems) {
          await OrderProduct.update(
            { quantity: item.quantity },
            {
              where: { id: item.id, orderId },
              transaction: t,
            }
          );
        }
      }

      // Remove items that were set to quantity 0
      if (removedItems && removedItems.length > 0) {
        await OrderProduct.destroy({
          where: {
            id: removedItems.map((item) => item.id),
            orderId,
          },
          transaction: t,
        });
      }

      const order = await Order.update(
        {
          status,
          total: totalAmount,
        },
        {
          where: { id: orderId },
          transaction: t,
          returning: true,
        }
      );

      return order;
    });

    res.status(200).json({
      status: "success",
      message: "Order updated successfully",
      data: {
        order: result,
        totalAmount: result.totalAmount,
        status: result.status,
      },
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating order",
      error: error.message,
    });
  }
};
