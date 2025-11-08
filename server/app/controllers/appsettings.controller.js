const db = require("../models");
const AppSettings = db.appSettings;

// Get a setting by key
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await AppSettings.findOne({
      where: { settingKey: key }
    });

    if (!setting) {
      return res.status(404).send({
        message: `Setting with key=${key} not found.`
      });
    }

    res.status(200).send(setting);
  } catch (error) {
    console.error("Error retrieving setting:", error);
    res.status(500).send({
      message: error.message || "Error retrieving setting."
    });
  }
};

// Get admin UPI (convenience method)
exports.getAdminUpi = async (req, res) => {
  try {
    const setting = await AppSettings.findOne({
      where: { settingKey: 'admin_upi' }
    });

    if (!setting) {
      // Return default if not found
      return res.status(200).send({
        upiId: '8125226626-2@ybl',
        settingKey: 'admin_upi',
        message: 'Using default UPI (not set in database)'
      });
    }

    res.status(200).send({
      upiId: setting.settingValue,
      settingKey: setting.settingKey,
      description: setting.description
    });
  } catch (error) {
    console.error("Error getting admin UPI:", error);
    res.status(500).send({
      message: error.message || "Error retrieving admin UPI."
    });
  }
};

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await AppSettings.findAll();
    res.status(200).send(settings);
  } catch (error) {
    console.error("Error retrieving settings:", error);
    res.status(500).send({
      message: error.message || "Error retrieving settings."
    });
  }
};

// Create or update a setting
exports.upsertSetting = async (req, res) => {
  try {
    const { settingKey, settingValue, description } = req.body;

    if (!settingKey || !settingValue) {
      return res.status(400).send({
        message: "settingKey and settingValue are required!"
      });
    }

    const [setting, created] = await AppSettings.findOrCreate({
      where: { settingKey },
      defaults: {
        settingKey,
        settingValue,
        description: description || null
      }
    });

    if (!created) {
      // Update existing setting
      await setting.update({
        settingValue,
        description: description || setting.description
      });
    }

    res.status(created ? 201 : 200).send({
      message: created ? "Setting created successfully!" : "Setting updated successfully!",
      setting
    });
  } catch (error) {
    console.error("Error upserting setting:", error);
    res.status(500).send({
      message: error.message || "Error saving setting."
    });
  }
};

// Delete a setting
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const num = await AppSettings.destroy({
      where: { settingKey: key }
    });

    if (num == 1) {
      res.status(200).send({
        message: "Setting was deleted successfully!"
      });
    } else {
      res.status(404).send({
        message: `Cannot delete setting with key=${key}. Setting not found!`
      });
    }
  } catch (error) {
    console.error("Error deleting setting:", error);
    res.status(500).send({
      message: error.message || "Could not delete setting."
    });
  }
};

// Get platform fees (convenience method)
exports.getPlatformFees = async (req, res) => {
  try {
    const feeBelow100 = await AppSettings.findOne({
      where: { settingKey: 'platform_fee_below_100' }
    });

    const feeAbove100 = await AppSettings.findOne({
      where: { settingKey: 'platform_fee_above_100' }
    });

    res.status(200).send({
      platformFeeBelow100: feeBelow100 ? parseInt(feeBelow100.settingValue) : 1,
      platformFeeAbove100: feeAbove100 ? parseInt(feeAbove100.settingValue) : 3,
      message: (!feeBelow100 || !feeAbove100) ? 'Using default values (not set in database)' : null
    });
  } catch (error) {
    console.error("Error getting platform fees:", error);
    res.status(500).send({
      message: error.message || "Error retrieving platform fees."
    });
  }
};

// Initialize default settings (can be called on first setup)
exports.initializeDefaults = async (req, res) => {
  try {
    const defaults = [
      {
        settingKey: 'admin_upi',
        settingValue: '8125226626-2@ybl',
        description: 'Admin UPI ID for subscription payments'
      },
      {
        settingKey: 'subscription_amount',
        settingValue: '5000',
        description: 'Default subscription amount per month in rupees'
      },
      {
        settingKey: 'platform_fee_below_100',
        settingValue: '1',
        description: 'Platform fee for orders below 100 rupees'
      },
      {
        settingKey: 'platform_fee_above_100',
        settingValue: '3',
        description: 'Platform fee for orders above 100 rupees'
      }
    ];

    const results = [];
    for (const def of defaults) {
      const [setting, created] = await AppSettings.findOrCreate({
        where: { settingKey: def.settingKey },
        defaults: def
      });
      results.push({ setting, created });
    }

    res.status(200).send({
      message: "Default settings initialized!",
      results
    });
  } catch (error) {
    console.error("Error initializing defaults:", error);
    res.status(500).send({
      message: error.message || "Error initializing default settings."
    });
  }
};
