const { verifyToken, verifyManager } = require("../middleware/authMiddleware");

module.exports = app => {
  const appSettings = require('../controllers/appsettings.controller');
  var router = require('express').Router();

  // Get admin UPI (any authenticated user can view)
  router.get('/admin/upi', verifyToken, appSettings.getAdminUpi);

  // Get a specific setting by key (manager only)
  router.get('/:key', verifyManager, appSettings.getSetting);

  // Get all settings (manager only)
  router.get('/', verifyManager, appSettings.getAllSettings);

  // Create or update a setting (manager only)
  router.post('/', verifyManager, appSettings.upsertSetting);

  // Delete a setting (manager only)
  router.delete('/:key', verifyManager, appSettings.deleteSetting);

  // Initialize default settings (manager only)
  router.post('/initialize/defaults', verifyManager, appSettings.initializeDefaults);

  app.use('/api/settings', router);
};
