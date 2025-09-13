const db = require("../models");
const Customer = db.customer;
const Role = db.roles;
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_secret_key";

// Create and Save a new Customer
exports.create = async (req, res) => {
  try {
    const { firstname, lastname, phone } = req.body;

    // Validate request
    if (!firstname || !lastname || !phone) {
      return res.status(400).send({
        message: "First name, last name and phone are required!",
      });
    }

    // Check if phone number already exists
    const existingCustomer = await Customer.findOne({
      where: { phone: phone },
    });

    if (existingCustomer) {
      return res.status(400).send({
        message:
          "Phone number already exists. Please use a different phone number.",
      });
    }

    // Get customer role
    const customerRole = await Role.findOne({ where: { name: "customer" } });
    if (!customerRole) {
      return res.status(404).send({
        message: "Customer role not found",
      });
    }

    // Create customer
    const customer = await Customer.create({
      firstname,
      lastname,
      phone,
    });

    res.status(201).send(customer);
  } catch (err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Customer.",
    });
  }
};

// Retrieve all Customers
exports.findAll = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });
    res.send(customers);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving customers.",
    });
  }
};

// Find a single Customer by Id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
    });

    if (!customer) {
      return res.status(404).send({
        message: `Customer not found with id ${id}`,
      });
    }

    res.send(customer);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Customer with id ${req.params.id}`,
    });
  }
};

// Update a Customer by Id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const [num] = await Customer.update(req.body, {
      where: { id: id },
    });

    if (num === 1) {
      res.send({
        message: "Customer was updated successfully.",
      });
    } else {
      res.send({
        message: `Cannot update Customer with id=${id}. Maybe Customer was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Error updating Customer with id=${req.params.id}`,
    });
  }
};

// Delete a Customer with the specified id
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const num = await Customer.destroy({
      where: { id: id },
    });

    if (num === 1) {
      res.send({
        message: "Customer was deleted successfully!",
      });
    } else {
      res.send({
        message: `Cannot delete Customer with id=${id}. Maybe Customer was not found!`,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: `Could not delete Customer with id=${req.params.id}`,
    });
  }
};

// Find Customer by phone number
exports.findByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).send({
        message: "Phone number is required",
      });
    }

    const customer = await Customer.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      ],
      raw: true,
      nest: true,
    });

    if (!customer) {
      return res.status(404).send({
        message: `Customer not found with phone ${phone}`,
      });
    }
    const token = jwt.sign(
      { id: customer.id, role: customer.role?.name, phone: customer.phone },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    // Only send necessary customer data
    const customerData = {
      id: customer.id,
      firstname: customer.firstname,
      lastname: customer.lastname,
      phone: customer.phone,
      token,
      role: customer.role
        ? {
            name: customer.role.name,
          }
        : null,
    };

    res.status(200).send(customerData);
  } catch (err) {
    res.status(500).send({
      message: `Error retrieving Customer with phone ${err}`,
    });
  }
};
