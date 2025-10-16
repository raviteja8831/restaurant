const db = require("../models");

const BuffetOrder = db.buffetOrder;

// Create and Save a new BuffetOrder
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body.userId || !req.body.restaurantId) {
      return res.status(400).send({
        message: "User ID and Restaurant ID are required!",
      });
    }

    // Create and save BuffetOrder in the database
    const buffetOrder = await BuffetOrder.create({
      userId: req.body.userId,
      restaurantId: req.body.restaurantId,
      buffetId: req.body.buffetId || null,
      persons: req.body.persons || 1,
      price: req.body.price || null,
      totalAmount: req.body.totalAmount || null,
      status: 'booked',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Buffet order created successfully",
      data: buffetOrder
    });
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the BuffetOrder.",
    });
  }
};

// Retrieve all BuffetOrders from the database
exports.findAll = async (req, res) => {
  try {
    const buffetOrders = await BuffetOrder.findAll({
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["name", "email"],
        },
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["name", "address"],
        },
      ],
    });
    res.json(buffetOrders);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving buffet orders.",
    });
  }
};

// Find a single BuffetOrder with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const buffetOrder = await BuffetOrder.findByPK(id, {
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["name", "email"],
        },
        {
          model: db.restaurant,
          as: "restaurant",
          attributes: ["name", "address"],
        },
      ],
    });

    if (!buffetOrder) {
      return res.status(404).send({
        message: "Buffet Order not found with id " + id,
      });
    }

    res.json(buffetOrder);
  } catch (err) {
    const id = req.params.id;
    res.status(500).send({
      message: "Error retrieving Buffet Order with id=" + id,
    });
  }
};

// Update a BuffetOrder by the id
exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "Data to update can not be empty!",
      });
    }

    const id = req.params.id;
    const [updated] = await BuffetOrder.update(
      {
        persons: req.body.persons,
        updatedAt: new Date(),
        ...req.body,
      },
      {
        where: { id: id },
      }
    );

    if (!updated) {
      return res.status(404).send({
        message: `Cannot update Buffet Order with id=${id}. Order not found!`,
      });
    }

    res.send({ message: "Buffet Order was updated successfully." });
  } catch (err) {
    res.status(500).send({
      message: "Error updating Buffet Order with id=" + id,
    });
  }
};

// Delete a BuffetOrder with the specified id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await BuffetOrder.destroy({
      where: { id: id },
    });

    if (!deleted) {
      return res.status(404).send({
        message: `Cannot delete Buffet Order with id=${id}. Order not found!`,
      });
    }

    res.send({
      message: "Buffet Order was deleted successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete Buffet Order with id=" + id,
    });
  }
};

// Get pending buffet orders for manager verification
exports.getPendingOrders = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const pendingOrders = await BuffetOrder.findAll({
      where: {
        restaurantId: restaurantId,
        status: "booked",
      },
      include: [
        {
          model: db.users,
          as: "user",
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: db.buffet,
          as: "buffet",
          attributes: ["id", "name", "price", "type"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: pendingOrders,
    });
  } catch (error) {
    console.error("Error in getPendingOrders:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving pending buffet orders",
      error: error.message,
    });
  }
};

// Manager verify payment and update status
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Buffet order ID is required",
      });
    }

    const buffetOrder = await BuffetOrder.findByPk(id);

    if (!buffetOrder) {
      return res.status(404).json({
        success: false,
        message: "Buffet order not found",
      });
    }

    if (buffetOrder.status === "payment_completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified for this order",
      });
    }

    await buffetOrder.update({
      status: "payment_completed",
      updatedAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: buffetOrder,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};
