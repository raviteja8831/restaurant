const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../models');

const Order = db.orders;
const Subscription = db.subscription;
const Commission = db.commission;
const Restaurant = db.restaurant;
const AppSettings = db.appSettings;

class RazorpayService {
  constructor() {
    // Log environment variables for debugging
    console.log('Initializing RazorpayService...');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');

    // Validate that credentials are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('ERROR: Razorpay credentials not found in environment variables!');
      console.error('Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in .env file');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    if (!this.razorpay) {
      throw new Error('Failed to initialize Razorpay client. Check environment variables.');
    }
  }

  /**
   * Create a Razorpay order for restaurant payment
   * @param {number} restaurantId - Restaurant ID
   * @param {number} orderId - Order ID or Booking ID
   * @param {number} amount - Amount in INR (will be converted to paise)
   * @param {string} description - Payment description
   * @returns {Promise<Object>} - Razorpay order object
   */
  async createOrder(restaurantId, orderId, amount, description = 'Order Payment') {
    try {
      // Check if restaurant has active subscription
      const hasSubscription = await this.checkActiveSubscription(restaurantId);

      // Create Razorpay order (amount in paise)
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

      console.log(`Created Razorpay order ${razorpayOrder.id} for booking/order ${orderId}`);

      // Calculate commission
      const commission = hasSubscription ? 0 : amount * (2.5 / 100);
      const commissionStatus = hasSubscription ? 'none' : 'pending';

      // Try to find existing order by Razorpay order ID (primary lookup)
      let order = await Order.findOne({
        where: { razorpayOrderId: razorpayOrder.id },
      });

      if (!order) {
        // Try to find by ID
        order = await Order.findByPk(orderId);
      }
      
      if (!order) {
        // If no order exists (table booking scenario), create a new order record
        console.log(`Order ${orderId} not found - creating new order for table booking`);
        order = await Order.create({
          userId: null, // Will be set from booking data if needed
          restaurantId: restaurantId,
          total: amount,
          status: 'pending',
          paymentMethod: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          commission: parseFloat(commission.toFixed(2)),
          commissionPercentage: 2.5,
          commissionStatus: commissionStatus,
          hasSubscription: hasSubscription,
          paymentDate: new Date(),
        });
        console.log(`Created new order record ${order.id} with Razorpay order ${razorpayOrder.id}`);
      } else {
        // Update existing order with Razorpay details
        await order.update({
          paymentMethod: 'razorpay',
          razorpayOrderId: razorpayOrder.id,
          commission: parseFloat(commission.toFixed(2)),
          commissionPercentage: 2.5,
          commissionStatus: commissionStatus,
          hasSubscription: hasSubscription,
          paymentDate: new Date(),
        });
        console.log(`Updated existing order ${order.id} with Razorpay details`);
      }

      return {
        success: true,
        razorpayOrder: razorpayOrder,
        orderId: orderId,
        hasSubscription: hasSubscription,
        commission: parseFloat(commission.toFixed(2)),
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
   * @param {Object} order - Order object with payment details
   * @returns {Promise<Object>} - Payment split result
   */
  async splitPayment(order) {
    try {
      const commission = order.commission || 0;
      const restaurantAmount = (order.total || 0) - commission;

      console.log(`Splitting payment for order ${order.id}: Total=${order.total}, Commission=${commission}, Restaurant=${restaurantAmount}`);

      let restaurantTransfer = null;
      let appProviderTransfer = null;

      // In production, perform actual Razorpay transfers
      // For now, we'll create commission records
      
      // Try to create commission record if commission exists
      if (commission > 0) {
        try {
          if (Commission) {
            const commissionRecord = await Commission.create({
              orderId: order.id,
              restaurantId: order.restaurantId,
              amount: commission,
              percentage: order.commissionPercentage || 2.5,
              status: 'paid',
              hasSubscription: order.hasSubscription,
              paymentMethod: 'razorpay',
              paidDate: new Date(),
            });
            console.log(`Commission record created: ID=${commissionRecord.id}, Amount=${commission}`);
          }
        } catch (commissionError) {
          console.error('Error creating commission record:', commissionError.message);
          // Don't fail payment if commission creation fails
        }

        // Update order commission status
        await order.update({
          commissionStatus: 'paid',
        });
      }

      return {
        success: true,
        restaurantTransfer: restaurantTransfer,
        appProviderTransfer: appProviderTransfer,
        commissionCreated: commission > 0,
      };
    } catch (error) {
      console.error('Error splitting payment:', error);
      throw new Error(`Failed to split payment: ${error.message}`);
    }
  }

  /**
   * Handle successful payment and update order
   * @param {string} razorpayOrderId - Razorpay order ID
   * @param {string} razorpayPaymentId - Razorpay payment ID
   * @param {string} signature - Payment signature
   * @returns {Promise<Object>} - Updated order object
   */
  async handlePaymentSuccess(razorpayOrderId, razorpayPaymentId, signature) {
    try {
      // Verify signature first
      if (!this.verifySignature(razorpayOrderId, razorpayPaymentId, signature)) {
        throw new Error('Invalid payment signature');
      }

      // Find order by razorpayOrderId
      const order = await Order.findOne({
        where: { razorpayOrderId: razorpayOrderId },
      });

      if (!order) {
        console.error(`Order not found for razorpayOrderId: ${razorpayOrderId}`);
        throw new Error('Order not found');
      }

      console.log(`Found order ID: ${order.id}, Current status: ${order.status}`);

      // Update order status
      await order.update({
        status: 'completed',
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: signature,
        paymentDate: new Date(),
      });

      console.log(`Order ${order.id} updated to completed status`);

      // Fetch the payment details from Razorpay to confirm
      const payment = await this.razorpay.payments.fetch(razorpayPaymentId);
      console.log(`Fetched payment details from Razorpay: ${razorpayPaymentId}`);

      // Split payment between restaurant and app provider
      const splitResult = await this.splitPayment(order);
      console.log(`Payment split completed for order ${order.id}`);

      return {
        success: true,
        order: order,
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
   * @returns {Promise<Object>} - Updated order object
   */
  async handlePaymentFailure(razorpayOrderId) {
    try {
      const order = await Order.findOne({
        where: { razorpayOrderId: razorpayOrderId },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      await order.update({
        status: 'failed',
      });

      return {
        success: true,
        order: order,
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
