const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../models');
const { Sequelize } = require('sequelize');

const restaurantUser = db.restaurantUser;
const Order = db.orders;
const MenuItem = db.menuItem;
const userMenuItem = db.userMenuItem;
const message = db.message;
const roles = db.roles;

const chefController = {};

chefController.chefLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('Login attempt for phone:', phone, password);
    const chef = await restaurantUser.findOne({ where: { phone }, include: [{ model: roles, as: 'role' }] });
    console.log('Chef found:', chef);
    if (!chef || !chef.role || chef.role.name !== 'Chef') {
      console.error('Chef not found or role missing:', chef);
      return res.status(404).json({ message: 'Chef not found' });
    }
    const valid = await bcrypt.compare(password, chef.password);
    if (!valid) {
      console.error('Invalid password for chef:', chef.phone);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    const token = jwt.sign({ id: chef.id, role: chef.role.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Only send public fields as 'user' for frontend compatibility
    const { id, phone: chefPhone, firstname, lastname, role, restaurantId } = chef;
    res.json({ token, user: { id, phone: chefPhone, firstname, lastname, role, restaurantId } });
  } catch (e) {
    console.error('Chef login error:', e);
    res.status(500).json({ message: 'Server error', error: e.message });
  }
};

chefController.chefProfile = async (req, res) => {
  try {
    const chef = await restaurantUser.findByPk(req.user.id, { attributes: { exclude: ['password'] }, include: [{ model: roles, as: 'role' }] });
    if (!chef || chef.role.name !== 'Chef') return res.status(404).json({ message: 'Chef not found' });
    res.json(chef);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

chefController.chefDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = parseInt(id, 10) || 2;
    console.log('Chef ID from params:', chefId, req.params);
    // Get menuitems allotted to chef
    const chef = await restaurantUser.findByPk(chefId, { include: [{ model: MenuItem, as: 'allottedMenuItems' }] });
    console.log('Chef details with allotted items:', chef);
    const menuItemIds = chef.allottedMenuItems.map(item => item.id);
    console.log('Menu Item IDs allotted to chef:', menuItemIds);
    // Get orders containing these menuitems
    let orders = [];
    if (menuItemIds.length > 0) {
      try {
        orders = await Order.findAll({
          include: [{
            model: db.orderProducts,
            as: 'orderProducts',
            where: { menuitemId: { [Op.in]: menuItemIds } },
            required: true,
            include: [{
              model: MenuItem,
              as: 'menuitem' // Use the correct alias as defined in your association
            }]
          }],
          order: [['createdAt', 'DESC']],
          limit: 10
        });
      } catch (err) {
        console.error('Order query failed:', err);
        return res.status(500).json({ message: 'Order query failed', error: err.message });
      }
    }
    console.log('Recent orders fetched:', orders);
    const totalOrders = await Order.count({
      include: [{
        model: db.orderProducts,
        as: 'orderProducts',
        where: { menuitemId: { [Op.in]: menuItemIds } },
        required: true
      }]
    });
    console.log(totalOrders, 'total')
    // const workingDays = await Order.count({
    //   include: [{
    //     model: db.orderProducts,
    //     as: 'orderProducts',
    //     where: { menuitemId: { [Op.in]: menuItemIds } },
    //     required: true
    //   }],
    //   distinct: true,
    //   col: Sequelize.fn('DATE', Sequelize.col('Order.createdAt'))
    // });
     const workingDays = 10;
    console.log('Orders fetched:', workingDays);
    // Most ordered dish
    const mostOrdered = await db.orderProducts.findAll({
      where: { menuitemId: { [Op.in]: menuItemIds } },
      attributes: ['menuitemId', [Sequelize.fn('COUNT', Sequelize.col('menuitemId')), 'count']],
      group: ['menuitemId', 'menuitem.id'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5,
      include: [{
        model: MenuItem,
        as: 'menuitem'
      }]
    });
    console.log('Most ordered item:', mostOrdered);
    res.json({ orders, totalOrders, workingDays, menuItems: chef.allottedMenuItems, mostOrdered });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

chefController.chefMessages = async (req, res) => {
  try {
    // Get userId from route param, fallback to req.user.id
    const chefId = req.params.userId ? parseInt(req.params.userId, 10) : req.user?.id;
    if (!chefId) return res.status(400).json({ message: 'Missing userId' });
    const chefRole = await roles.findOne({ where: { name: 'Chef' } });
    const managerRole = await roles.findOne({ where: { name: 'Manager' } });
    const messagesList = await message.findAll({
      where: {
        [Op.or]: [
          { fromUserId: chefId, fromRoleId: chefRole.id, toRoleId: managerRole.id },
          { toUserId: chefId, toRoleId: chefRole.id, fromRoleId: managerRole.id }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    res.json({ messages: messagesList });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

chefController.sendChefMessage = async (req, res) => {
  try {
    const chefId = req.user.id;
    const chefRole = await roles.findOne({ where: { name: 'Chef' } });
    const managerRole = await roles.findOne({ where: { name: 'Manager' } });
    // Find all managers in the same restaurant
    const chef = await restaurantUser.findByPk(chefId);
    const managers = await restaurantUser.findAll({ where: { restaurantId: chef.restaurantId, role_id: managerRole.id } });
    const { message: msg } = req.body;
    // Send message to all managers
    for (const mgr of managers) {
      await message.create({
        fromUserId: chefId,
        fromRoleId: chefRole.id,
        toUserId: mgr.id,
        toRoleId: managerRole.id,
        message: msg
      });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = chefController;
