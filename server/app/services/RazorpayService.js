const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../models');

const Subscription = db.subscription;
const Transaction = db.transaction;
const Restaurant = db.restaurant;
const AppSettings = db.appsettings;

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay order for restaurant payment
   * @param {number} restaurantId - Restaurant ID
   * @param {number} orderId - Order ID
   * @param {number} amount - Amount in INR (will be converted to paise)
   * @param {string} description - Payment description
   * @returns {Promise<Object>} - Razorpay order object
   */
  async createOrder(restaurantId, orderId, amount, description = 'Order Payment') {
    try {
      // Check if restaurant has active subscription
      const hasSubscription = await this.checkActiveSubscription(restaurantId);

      // Create order in Razorpay (amount in paise)
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `order_${orderId}_${restaurantId}`,
        description: description,
        notes: {
          restaurantId: restaurantId,
          orderId: orderId,
          hasSubscription: hasSubscription,
          timestamp: new Date().toISOString(),
        },
      });

      // Calculate commission
      const commission = hasSubscription ? 0 : amount * (2.5 / 100);
      const commissionStatus = hasSubscription ? 'none' : 'pending';

      // Create transaction record
      const transaction = await Transaction.create({
        orderId: orderId,
        restaurantId: restaurantId,
        amount: amount,
        status: 'pending',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        commission: commission,
        commissionPercentage: 2.5,
        commissionStatus: commissionStatus,
        hasSubscription: hasSubscription,
      });

      return {
        success: true,
        razorpayOrder: razorpayOrder,
        transaction: transaction,
        hasSubscription: hasSubscription,
        commission: commission,
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify Razorpay payment signature
   * @param {string} razorpayOrderId - Razorpay order ID
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @param {string} signature - Payment signature from payment response
   * @returns {boolean} - True if signature is valid
   */
  verifySignature(razorpayOrderId, razorpayPaymentId, signature) {
    try {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Split payment between restaurant and app provider
   * @param {Object} transaction - Transaction object
   * @returns {Promise<Object>} - Payment split result
   */
  async splitPayment(transaction) {
    try {
      // Get restaurant UPI
      const restaurant = await Restaurant.findByPk(transaction.restaurantId);
      if (!restaurant || !restaurant.upi) {
        throw new Error(`Restaurant UPI not found for restaurant ${transaction.restaurantId}`);
      }

      // Get app provider UPI from settings
      const appSettings = await AppSettings.findOne({
        where: { settingKey: 'admin_upi' },
      });
      if (!appSettings || !appSettings.settingValue) {
        throw new Error('App provider UPI not configured in settings');
      }

      const restaurantUPI = restaurant.upi;
      const appProviderUPI = appSettings.settingValue;
      const commission = transaction.commission || 0;
      const restaurantAmount = transaction.amount - commission;

      // Create transfer to restaurant
      const restaurantTransfer = await this.razorpay.transfers.create({
        account: restaurantUPI,
        amount: Math.round(restaurantAmount * 100), // in paise
        currency: 'INR',
        description: `Payment for order ${transaction.orderId}`,
      });

      // Create transfer to app provider (if commission exists)
      let appProviderTransfer = null;
      if (commission > 0) {
        appProviderTransfer = await this.razorpay.transfers.create({
          account: appProviderUPI,
          amount: Math.round(commission * 100), // in paise
          currency: 'INR',
          description: `Commission for order ${transaction.orderId}`,
        });

        // Update commission status to paid
        await db.commission.update(
          { status: 'paid' },
          { where: { transactionId: transaction.id } }
        );
      }

      return {
        success: true,
        restaurantTransfer: restaurantTransfer,
        appProviderTransfer: appProviderTransfer,
      };
    } catch (error) {
      console.error('Error splitting payment:', error);
      throw new Error(`Failed to split payment: ${error.message}`);
    }
  }

  /**
   * Handle successful payment and update transaction
   * @param {string} razorpayOrderId - Razorpay order ID
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @param {string} signature - Payment signature
   * @returns {Promise<Object>} - Updated transaction object
   */
  async handlePaymentSuccess(razorpayOrderId, razorpayPaymentId, signature) {
    try {
      // Verify signature first
      if (!this.verifySignature(razorpayOrderId, razorpayPaymentId, signature)) {
        throw new Error('Invalid payment signature');
      }

      // Find transaction by razorpayOrderId
      const transaction = await Transaction.findOne({
        where: { razorpayOrderId: razorpayOrderId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction status
      await transaction.update({
        status: 'completed',
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: signature,
      });

      // Fetch the payment details from Razorpay to confirm
      const payment = await this.razorpay.payments.fetch(razorpayPaymentId);

      // Split payment between restaurant and app provider
      const splitResult = await this.splitPayment(transaction);

      return {
        success: true,
        transaction: transaction,
        payment: payment,
        paymentSplit: splitResult,
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  /**
   * Handle failed payment
   * @param {string} razorpayOrderId - Razorpay order ID
   * @returns {Promise<Object>} - Updated transaction object
   */
  async handlePaymentFailure(razorpayOrderId) {
    try {
      const transaction = await Transaction.findOne({
        where: { razorpayOrderId: razorpayOrderId },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      await transaction.update({
        status: 'failed',
      });

      return {
        success: true,
        transaction: transaction,
      };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      throw new Error(`Failed to process payment failure: ${error.message}`);
    }
  }

  /**
   * Check if restaurant has active subscription
   * @param {number} restaurantId - Restaurant ID
   * @returns {Promise<boolean>} - True if has active subscription
   */
  async checkActiveSubscription(restaurantId) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          restaurantId: restaurantId,
          paymentStatus: 'completed',
        },
      });

      if (!subscription) {
        return false;
      }

      // Check if subscription is still valid (not expired)
      const today = new Date();
      const endDate = new Date(subscription.endDate);

      return endDate >= today;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Get payment details for transaction
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @returns {Promise<Object>} - Payment details
   */
  async getPaymentDetails(razorpayPaymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(razorpayPaymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw new Error(`Failed to fetch payment details: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  async getTransactionDetails(transactionId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Get payment details if available
      let paymentDetails = null;
      if (transaction.razorpayPaymentId) {
        paymentDetails = await this.getPaymentDetails(transaction.razorpayPaymentId);
      }

      return {
        transaction: transaction,
        payment: paymentDetails,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw new Error(`Failed to get transaction details: ${error.message}`);
    }
  }

  /**
   * Calculate and track commission for admin
   * @param {number} transactionId - Transaction ID
   * @returns {Promise<Object>} - Commission details
   */
  async calculateCommission(transactionId) {
    try {
      const transaction = await Transaction.findByPk(transactionId);

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // If already has subscription, no commission
      if (transaction.hasSubscription) {
        return {
          success: true,
          commission: 0,
          commissionStatus: 'none',
          reason: 'Restaurant has active subscription - no commission charged',
        };
      }

      // Calculate commission (2.5% of transaction)
      const commission = transaction.amount * (2.5 / 100);

      return {
        success: true,
        transactionId: transactionId,
        amount: transaction.amount,
        commission: commission,
        commissionPercentage: 2.5,
        commissionStatus: transaction.commissionStatus,
      };
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw new Error(`Failed to calculate commission: ${error.message}`);
    }
  }

  /**
   * Get all transactions for a restaurant
   * @param {number} restaurantId - Restaurant ID
   * @param {Object} options - Filter options (status, dateFrom, dateTo, etc.)
   * @returns {Promise<Array>} - List of transactions
   */
  async getRestaurantTransactions(restaurantId, options = {}) {
    try {
      const where = { restaurantId: restaurantId };

      if (options.status) {
        where.status = options.status;
      }

      if (options.dateFrom || options.dateTo) {
        where.date = {};
        if (options.dateFrom) {
          where.date[db.Sequelize.Op.gte] = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          where.date[db.Sequelize.Op.lte] = new Date(options.dateTo);
        }
      }

      const transactions = await Transaction.findAll({
        where: where,
        order: [['date', 'DESC']],
      });

      return transactions;
    } catch (error) {
      console.error('Error getting restaurant transactions:', error);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Get commission summary for admin
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} - Commission summary
   */
  async getCommissionSummary(options = {}) {
    try {
      const where = {
        commissionStatus: { [db.Sequelize.Op.ne]: 'none' },
      };

      if (options.status) {
        where.commissionStatus = options.status;
      }

      if (options.dateFrom || options.dateTo) {
        where.date = {};
        if (options.dateFrom) {
          where.date[db.Sequelize.Op.gte] = new Date(options.dateFrom);
        }
        if (options.dateTo) {
          where.date[db.Sequelize.Op.lte] = new Date(options.dateTo);
        }
      }

      const transactions = await Transaction.findAll({
        where: where,
      });

      const pendingCommission = transactions
        .filter(t => t.commissionStatus === 'pending')
        .reduce((sum, t) => sum + t.commission, 0);

      const paidCommission = transactions
        .filter(t => t.commissionStatus === 'paid')
        .reduce((sum, t) => sum + t.commission, 0);

      const totalCommission = pendingCommission + paidCommission;

      return {
        totalTransactions: transactions.length,
        totalCommission: totalCommission,
        pendingCommission: pendingCommission,
        paidCommission: paidCommission,
        subscriptionTransactions: transactions.filter(t => t.hasSubscription).length,
        nonSubscriptionTransactions: transactions.filter(t => !t.hasSubscription).length,
      };
    } catch (error) {
      console.error('Error getting commission summary:', error);
      throw new Error(`Failed to get commission summary: ${error.message}`);
    }
  }
}

module.exports = RazorpayService;
