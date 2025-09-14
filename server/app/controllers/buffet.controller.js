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
      persons: req.body.persons || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(buffetOrder);
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
