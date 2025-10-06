const jwt = require('jsonwebtoken');
const db = require('../models');

// Load environment variables
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Debug: Log JWT secret loading
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not found in environment, using fallback');
} else {
  console.log('✅ JWT_SECRET loaded successfully');
}

/**
 * Basic JWT token verification middleware
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log('🔐 Token verification attempt for:', req.method, req.path);

  if (!authHeader) {
    console.log('❌ No authorization header');
    return res.status(401).json({
      success: false,
      message: 'No token provided',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ Invalid token format');
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
      code: 'INVALID_TOKEN_FORMAT'
    });
  }

  try {
    console.log('🔍 Verifying token with secret:', JWT_SECRET ? 'Available' : 'Missing');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verified successfully for user:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error.message);
    console.log('🔍 Token payload preview:', token.substring(0, 50) + '...');
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'TOKEN_EXPIRED',
      error: error.message
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

    // Debug: show decoded token info
    console.log('🔎 verifyCustomer - decoded token:', decoded);

    // Try to find customer in the customers table first (db.customer)
    let customer = null;
    try {
      if (db.customer) {
        customer = await db.customer.findByPk(decoded.id, {
          include: [{ model: db.roles, as: 'role', attributes: ['id', 'name'] }],
        });
      }
    } catch (e) {
      console.log('⚠️ verifyCustomer - error querying db.customer:', e.message);
    }

    // Fallback: check users table if not found in customer table
    if (!customer) {
      try {
        customer = await db.users.findByPk(decoded.id);
        if (customer) console.log('ℹ️ verifyCustomer - found in db.users, id:', decoded.id);
      } catch (e) {
        console.log('⚠️ verifyCustomer - error querying db.users fallback:', e.message);
      }
    }

    if (!customer) {
      console.log('❌ verifyCustomer - customer not found for id:', decoded.id);
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