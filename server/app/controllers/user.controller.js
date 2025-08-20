const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = db.users;
const Role = db.roles;

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// User registration
exports.register = async (req, res) => {
  try {
    const { phone, roleName } = req.body;
    // Find the role by name (default to "StoreAdmin" if not provided)
    const role = await Role.findOne({ where: { name: roleName || "StoreAdmin" } });
    if (!role) {
      return res.status(400).send({ message: "Role not found!" });
    }
    // Create a new user with the role's ID
    const user = await User.create({
      phone,
      role_id: role.id, // Set the foreign key
    });
    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// User login with phone and OTP
exports.login = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // Find user by phone
    const user = await User.findOne({
      where: { phone },
      include: {
        model: Role,
        as: "role",
        attributes: ["name"],
      },
    });
    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }
    // Mock OTP validation (replace with real OTP logic)
    if (otp !== "1234") {
      return res.status(401).send({ message: "Invalid OTP!" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.status(200).send({
      id: user.id,
      phone: user.phone,
      role: user.role ? user.role.name : null,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};
const SupplyDate = db.supplydate;

