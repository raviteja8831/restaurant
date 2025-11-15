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

    // First, check if order exists and get its details
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    // Check order status - only allow deletion of PENDING orders
    if (order.status !== "PENDING") {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete order. Order is already being processed.",
        errorCode: "ORDER_ALREADY_PROCESSED",
        currentStatus: order.status,
      });
    }

    // Check order age - only allow deletion within 45 seconds
    const orderAge = (new Date() - new Date(order.createdAt)) / 1000; // in seconds
    const MAX_DELETION_AGE = 45; // 45 seconds

    if (orderAge > MAX_DELETION_AGE) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete order. The 45-second deletion window has expired. Your order is already being processed.",
        errorCode: "DELETION_WINDOW_EXPIRED",
        orderAge: Math.floor(orderAge),
        maxAge: MAX_DELETION_AGE,
      });
    }

    // All validations passed - proceed with deletion
    // First, delete all associated order items
    await OrderProduct.destroy({
      where: { orderId: orderId },
    });

    // Then delete the order itself
    await Order.destroy({
      where: { id: orderId },
    });

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
              { quantity: item.quantity, comments: item.comments || "" },
              { where: { id: item.orderItemId, orderId: req.body.orderID } } // Changed from orderId to orderID
            );
          } else {
            // Create new order item
            await OrderProduct.create({
              orderId: req.body.orderID, // Changed from orderId to orderID
              menuitemId: item.id,
              quantity: item.quantity,
              comments: item.comments || "",
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
      /*    if (remainingProducts === 0) {
        await existingOrder.destroy();
        return res
          .status(200)
          .json({ message: "Order deleted as no items remain" });
      } */

      return res.status(200).json(existingOrder);
    } else {
      // Create new order if no orderID provided
      var order_data = {
        restaurantId: parseInt(req.body.restaurantId),
        userId: parseInt(req.body.userId),
        total: parseFloat(req.body.total) || 0,
        tableId: req.body.tableId ? parseInt(req.body.tableId) : null, // Allow null for non-table orders
      };
      order_data.status = "PENDING";
      const order = await Order.create(order_data);

      // Check if order items exist in the request body
      if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
        try {
          // Create order products for each item
          const orderProducts_ = req.body.orderItems.map((item) => ({
            orderId: order.id,
            menuitemId: item.id, // Changed from item.menuId to item.id
            quantity: item.quantity,
            // status: 1, // Default status for new items
            comments: item.comments || "", // Added comments field
          }));

          // Bulk create all order products
          await OrderProduct.bulkCreate(orderProducts_);
        } catch (itemError) {
          // If there's an error creating order items, delete the order
          await order.destroy();
          console.error("Error creating order items:", itemError);
          return res.status(400).json({
            error: "Failed to add items to order. Please verify the items exist.",
            details: itemError.message,
            from: "Error creating order items"
          });
        }
      }
      res.status(201).json(order);
    }
  } catch (err) {
    console.error("Error in createOrder:", err);
    res
      .status(500)
      .json({ error: err.message, from: "Error creating order." });
  }
};
exports.deleteOrderItems = async (req, res) => {
  try {
    const { removedItems } = req.body;
    const existingOrder = await Order.findByPk(req.body.orderID);
    if (!existingOrder) {
      return res.status(404).json({ status: "error", message: "Order not found" });
    }
    // Remove items from the order
    if (Array.isArray(removedItems) && removedItems.length > 0) {
      await OrderProduct.destroy({
        where: {
          id: removedItems.map((item) => item.orderItemId),
          orderId: req.body.orderID,
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Order items deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteOrderItems:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting order items",
      error: error.message,
    });
  }
};

// Get pending orders with item count and total for a restaurant
exports.getPendingOrders = async (req, res) => {
  try {
    const { restaurantId, userId } = req.params;

    // First, get the first pending order for this user and restaurant
    const pendingOrder = await Order.findOne({
      where: {
        restaurantId: restaurantId,
        userId: userId,
        status: "PENDING",
      },
      attributes: ["id"],
      order: [["createdAt", "DESC"]], // Get the most recent pending order
    });

    // If no pending order exists, return zeros
    if (!pendingOrder) {
      return res.status(200).json({
        orderId: null,
        totalOrders: 0,
        totalOrdersAmount: 0,
      });
    }

    // Get the total items and amount for THIS specific order only
    const totalStats = await db.sequelize.query(
      `
        SELECT
          COALESCE(SUM(op.quantity), 0) as totalOrders,
          COALESCE(SUM(op.quantity * mi.price), 0) as totalOrdersAmount
        FROM ordersproduct op
        INNER JOIN menuitem mi ON op.menuitemId = mi.id
        WHERE op.orderId = :orderId
      `,
      {
        replacements: { orderId: pendingOrder.id },
        type: db.sequelize.QueryTypes.SELECT,
      }
    );

    const stats = totalStats[0] || { totalOrders: 0, totalOrdersAmount: 0 };
    const response = {
      orderId: pendingOrder.id,
      totalOrders: parseInt(stats.totalOrders) || 0,
      totalOrdersAmount: parseFloat(stats.totalOrdersAmount) || 0,
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
        }
       
      ],
      raw: true,
      nest: true,
    });

    const formatted = orderItems.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      menuItemId: item.menuitem.id,
      menuItemName: item.menuitem.name,
      price: item.menuitem.price,
      quantity: item.quantity,
      statusText:'',
      status: item.status || order.status, // Use OrderProduct status if available, otherwise use Order status
      comments: item.comments || "",
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
        orderItems: orderItems,
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
    const { totalAmount, updatedItems, removedItems, status } = req.body;

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

      // Determine order status: use provided status or default to COMPLETED
      const orderStatus = status || "COMPLETED";

      const order = await Order.update(
        {
          status: orderStatus,
          total: totalAmount,
        },
        {
          where: { id: orderId },
          transaction: t,
          returning: true,
        }
      );

      // Fetch updated order to return
      const updatedOrder = await Order.findByPk(orderId, { transaction: t });

      return updatedOrder;
    });

    res.status(200).json({
      status: "success",
      message: "Order updated successfully",
      data: {
        order: result,
        totalAmount: result.total,
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
exports.getOrderProductsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderProducts = await OrderProduct.findAll({
      where: { orderId },
      include: [
        {
          model: MenuItem,
          as: "menuitem",
          attributes: ["id", "name", "price"],
        },
      ],
      attributes: [
        "id",
        "orderId",
        "menuitemId",
        "quantity",
        "status",
        "comments",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!orderProducts || orderProducts.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No order products found for this order",
      });
    }
    // Mark found order products as 'ORDERED' status ONLY if they don't have a status yet
    try {
      await OrderProduct.update(
        { status: 'ORDERED' },
        {
          where: {
            orderId,
            status: null // Only update items without a status
          },
        }
      );
    } catch (updErr) {
      console.error('Error updating order products status:', updErr);
    }
    res.status(200).json({
      status: "success",
      data: orderProducts,
    });
  } catch (error) {
    console.error("Error in getOrderProductsByOrderId:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching order products",
      error: error.message,
    });
  }
};

exports.updateOrderProductStatusList = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status exists in orderStatus table
    // const validStatus = await db.orderStatus.findByPk(status);
    // if (!validStatus) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Invalid status ID provided",
    //   });
    // }

    // Start a transaction
    const result = await db.sequelize.transaction(async (t) => {
      // Fetch updated order products
      const updatedProducts = await OrderProduct.findAll({
        where: { orderId },
        transaction: t,
      });

      // Bulk update all products with the new status (remove status: null condition)
      await OrderProduct.update(
        { status: status },
        {
          where: { orderId },
          transaction: t,
        }
      );

      // Also update the main order status to PLACED when status is ORDERED
      if (status === "ORDERED") {
        await Order.update(
          { status: "PLACED" },
          {
            where: { id: orderId },
            transaction: t,
          }
        );
      }

      return updatedProducts;
    });

    res.status(200).json({
      status: "success",
      message: "Order products updated successfully and order status set to PLACED",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateOrderProductStatusList:", error);
    res.status(500).json({
      status: "error",
      message: "Error updating order products",
      error: error.message,
    });
  }
};

// Get PAID orders for a restaurant (for manager)
exports.getPaidOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const paidOrders = await Order.findAll({
      where: {
        restaurantId: restaurantId,
        status: "PAID",
      },
      include: [
        {
          model: db.users,
          as: "orderUser",
          attributes: ["firstname", "lastname", "phone"],
        },
        {
          model: db.orderProducts,
          as: "orderProducts",
          include: [
            {
              model: MenuItem,
              as: "menuitem",
              attributes: ["name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedOrders = paidOrders.map((order) => ({
      id: order.id,
      customerName: order.orderUser
        ? `${order.orderUser.firstname || ""} ${order.orderUser.lastname || ""}`.trim()
        : "Unknown",
      customerPhone: order.orderUser?.phone || "",
      date: new Date(order.createdAt).toLocaleDateString(),
      time: new Date(order.createdAt).toLocaleTimeString(),
      totalAmount: order.total,
      tableId: order.tableId,
      items: order.orderProducts.map((product) => ({
        name: product.menuitem?.name || "Unknown",
        quantity: product.quantity,
        price: product.menuitem?.price || 0,
        total: product.quantity * (product.menuitem?.price || 0),
      })),
    }));

    res.status(200).json({
      status: "success",
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error in getPaidOrders:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching paid orders",
      error: error.message,
    });
  }
};

// Get user's pending payment orders (PLACED but not PAID)
exports.getUserPendingPayments = async (req, res) => {
  try {
    const { restaurantId, userId } = req.params;

    const pendingPaymentOrders = await Order.findAll({
      where: {
        restaurantId: restaurantId,
        userId: userId,
        status: "PLACED", // Orders that have been placed but not yet paid
      },
      include: [
        {
          model: db.orderProducts,
          as: "orderProducts",
          include: [
            {
              model: MenuItem,
              as: "menuitem",
              attributes: ["name", "price"],
            },
          ],
        },
        {
          model: Restaurant,
          as: "orderRestaurant",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!pendingPaymentOrders || pendingPaymentOrders.length === 0) {
      return res.status(404).send({
        hasPendingPayments: false,
        orders: [],
        message: "No pending payment orders found"
      });
    }

    const formattedOrders = pendingPaymentOrders.map((order) => ({
      id: order.id,
      restaurantId: order.restaurantId,
      restaurantName: order.orderRestaurant?.name || "Unknown",
      total: order.total,
      createdAt: order.createdAt,
      items: order.orderProducts.map((product) => ({
        name: product.menuitem?.name || "Unknown",
        quantity: product.quantity,
        price: product.menuitem?.price || 0,
        total: product.quantity * (product.menuitem?.price || 0),
      })),
    }));

    res.status(200).json({
      hasPendingPayments: true,
      orders: formattedOrders,
      message: `You have ${formattedOrders.length} pending payment order(s)`,
    });
  } catch (error) {
    console.error("Error in getUserPendingPayments:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching pending payment orders",
      error: error.message,
    });
  }
};
