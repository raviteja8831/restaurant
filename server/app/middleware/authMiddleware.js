const jwt = require('jsonwebtoken');
const db = require('../models');

// Load environment variables
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Basic JWT token verification middleware
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED'
    });
  }
};

/**
 * Middleware to verify token and check if user is a customer
 */
const verifyCustomer = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN',
      userType: 'customer'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT',
      userType: 'customer'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists in customer table
    const customer = await db.users.findByPk(decoded.id);
    if (!customer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Customer not found.',
        code: 'CUSTOMER_NOT_FOUND',
        userType: 'customer'
      });
    }

    req.user = decoded;
    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED',
      userType: 'customer'
    });
  }
};

/**
 * Middleware to verify token and check if user is a restaurant user (Manager or Chef)
 */
const verifyRestaurantUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN',
      userType: 'restaurant'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT',
      userType: 'restaurant'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user exists in restaurant user table
    const restaurantUser = await db.restaurantUser.findOne({
      where: { id: decoded.id },
      include: [
        {
          model: db.roles,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!restaurantUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Restaurant user not found.',
        code: 'RESTAURANT_USER_NOT_FOUND',
        userType: 'restaurant'
      });
    }

    req.user = decoded;
    req.restaurantUser = restaurantUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED',
      userType: 'restaurant'
    });
  }
};

/**
 * Middleware to verify token and check if user is a manager (role_id = 1)
 */
const verifyManager = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN',
      userType: 'restaurant'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT',
      userType: 'restaurant'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is a manager
    const manager = await db.restaurantUser.findOne({
      where: {
        id: decoded.id,
        role_id: 1 // Manager role
      },
      include: [
        {
          model: db.roles,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!manager) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager privileges required.',
        code: 'MANAGER_ACCESS_REQUIRED',
        userType: 'restaurant'
      });
    }

    req.user = decoded;
    req.manager = manager;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED',
      userType: 'restaurant'
    });
  }
};

/**
 * Middleware to verify token and check if user is a chef (role_id = 2)
 */
const verifyChef = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN',
      userType: 'restaurant'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT',
      userType: 'restaurant'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user is a chef
    const chef = await db.restaurantUser.findOne({
      where: {
        id: decoded.id,
        role_id: 2 // Chef role
      },
      include: [
        {
          model: db.roles,
          as: 'role',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!chef) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Chef privileges required.',
        code: 'CHEF_ACCESS_REQUIRED',
        userType: 'restaurant'
      });
    }

    req.user = decoded;
    req.chef = chef;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED',
      userType: 'restaurant'
    });
  }
};

module.exports = {
  verifyToken,
  verifyCustomer,
  verifyRestaurantUser,
  verifyManager,
  verifyChef
};