const db = require("../models");
const Subscription = db.subscription;
const Restaurant = db.restaurant;
const AppSettings = db.appSettings;

// Helper function to get admin UPI from settings
async function getAdminUpiFromSettings() {
  try {
    const setting = await AppSettings.findOne({
      where: { settingKey: 'admin_upi' }
    });
    // Return setting value or default if not found
    return setting ? setting.settingValue : '8125226626-2@ybl';
  } catch (error) {
    console.error("Error fetching admin UPI:", error);
    return '8125226626-2@ybl'; // fallback to default
  }
}

// Create a new subscription
exports.create = async (req, res) => {
  try {
    const { restaurantId, amount, startDate, endDate, transactionId } = req.body;

    // Validate required fields
    if (!restaurantId) {
      return res.status(400).send({
        message: "Restaurant ID is required!"
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).send({
        message: `Restaurant with id=${restaurantId} not found.`
      });
    }

    // Calculate dates if not provided (monthly subscription)
    const subStartDate = startDate || new Date();
    const subEndDate = endDate || new Date(new Date().setMonth(new Date().getMonth() + 1));

    // Get admin UPI from database
    const adminUpi = await getAdminUpiFromSettings();

    // Create subscription
    const subscription = await Subscription.create({
      restaurantId,
      amount: amount || 5000.00,
      startDate: subStartDate,
      endDate: subEndDate,
      upiId: adminUpi,
      paymentStatus: transactionId ? 'completed' : 'pending',
      transactionId: transactionId || null,
    });

    res.status(201).send({
      message: "Subscription created successfully!",
      subscription
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).send({
      message: error.message || "Some error occurred while creating the subscription."
    });
  }
};

// Get all subscriptions for a restaurant
exports.findAllByRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const subscriptions = await Subscription.findAll({
      where: { restaurantId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).send(subscriptions);
  } catch (error) {
    console.error("Error retrieving subscriptions:", error);
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving subscriptions."
    });
  }
};

// Get latest subscription for a restaurant
exports.getLatest = async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;

    const subscription = await Subscription.findOne({
      where: { restaurantId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['id', 'name']
      }]
    });

    if (!subscription) {
      return res.status(404).send({
        message: `No subscription found for restaurant id=${restaurantId}.`
      });
    }

    res.status(200).send(subscription);
  } catch (error) {
    console.error("Error retrieving latest subscription:", error);
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving the subscription."
    });
  }
};

// Update subscription payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { paymentStatus, transactionId } = req.body;

    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).send({
        message: `Subscription with id=${id} not found.`
      });
    }

    await subscription.update({
      paymentStatus: paymentStatus || subscription.paymentStatus,
      transactionId: transactionId || subscription.transactionId,
    });

    res.status(200).send({
      message: "Subscription updated successfully!",
      subscription
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).send({
      message: error.message || "Error updating subscription."
    });
  }
};

// Delete a subscription
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    const num = await Subscription.destroy({
      where: { id }
    });

    if (num == 1) {
      res.status(200).send({
        message: "Subscription was deleted successfully!"
      });
    } else {
      res.status(404).send({
        message: `Cannot delete subscription with id=${id}. Subscription not found!`
      });
    }
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).send({
      message: error.message || "Could not delete subscription."
    });
  }
};

// Get admin UPI ID
exports.getAdminUpi = async (req, res) => {
  try {
    const adminUpi = await getAdminUpiFromSettings();
    res.status(200).send({
      upiId: adminUpi
    });
  } catch (error) {
    console.error("Error getting admin UPI:", error);
    res.status(500).send({
      message: error.message || "Error retrieving admin UPI."
    });
  }
};
