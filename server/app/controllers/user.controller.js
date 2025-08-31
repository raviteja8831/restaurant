// File upload handler
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded' });
    }
    // Save file URL (relative to server)
    const fileUrl = `/assets/images/${req.file.filename}`;
    res.status(200).send({ url: fileUrl });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
// Add Restaurant User (Chef or other role)

const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { ensureUploadDir, getUploadFilename } = require('../utils/imageUploadHelper');

const User = db.users;
const Role = db.roles;

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../../assets/images');
ensureUploadDir(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, getUploadFilename(file));
  }
});
const upload = multer({ storage });

// User registration (manager)
exports.register = async (req, res) => {
  console.log('--- Register endpoint hit ---');
  console.log('Request object:', req);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  try {
  const { phone, firstname, lastname, email, name, restaurantAddress, restaurantType, ambiancePhoto, logo, foodType, enableBuffet } = req.body;

    // Convert restaurantType and foodType to comma-separated values if array
    let restaurantTypeStr = '';
    if (Array.isArray(restaurantType)) {
      restaurantTypeStr = restaurantType.join(',');
    } else {
      restaurantTypeStr = restaurantType;
    }
    let foodTypeStr = '';
    if (Array.isArray(foodType)) {
      foodTypeStr = foodType.join(',');
    } else {
      foodTypeStr = foodType;
    }

    // Upload ambiancePhoto if it's a file (base64 or file path)
    let ambianceImageUrl = '';
      ambianceImageUrl = ambiancePhoto;

    // Upload logo if needed (similar logic)
    let logoImageUrl = '';
   
      logoImageUrl = logo;

    // Create restaurant first
    const restaurant = await db.restaurant.create({
      name: name,
      address: restaurantAddress,
      restaurantType: restaurantTypeStr,
      foodType: foodTypeStr,
      enableBuffet: enableBuffet === true || enableBuffet === 'true',
      ambianceImage: ambianceImageUrl,
      logoImage: logoImageUrl
    });

    // Create manager user for the restaurant
    const managerUser = await db.restaurantUser.create({
      phone,
      firstname,
      lastname,
      restaurantId: restaurant.id,
      role_id: 1, // 1 = manager
    });

    res.status(201).send({ message: "Manager and restaurant registered successfully!", managerUser, restaurant });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// User login with phone and OTP
exports.login = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    // Find user by phone
    const user = await db.restaurantUser.findOne({
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

// Create user (admin use)
exports.create = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users
exports.findAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user by ID
exports.findOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.update = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
exports.delete = async (req, res) => {
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
  }
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
exports.addRestaurantUser = async (req, res) => {
  try {
    const { name, password, role, phone, restaurantId } = req.body;
    if (!name || !password || !role || !phone || !restaurantId) {
      return res.status(400).send({ message: 'Missing required fields' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.restaurantUser.create({
      firstname: name,
      password: hashedPassword,
      role,
      phone,
      restaurantId
    });
    res.status(201).send({ message: 'User added successfully', user });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
