module.exports = app => {
const express = require('express');

const router = express.Router();
const chefController = require('../controllers/chef.controller');
const auth = require('../middleware/auth');

router.post('/login', chefController.chefLogin);
// router.get('/profile', auth, chefController.chefProfile);
// router.get('/dashboard', auth, chefController.chefDashboard);
// router.get('/messages', auth, chefController.chefMessages);
// router.post('/messages', auth, chefController.sendChefMessage);
router.get('/profile',chefController.chefProfile);
router.get('/dashboard/:id', chefController.chefDashboard);
router.get('/messages', chefController.chefMessages);
router.post('/messages',  chefController.sendChefMessage);
  app.use('/api/chef', router);

}
