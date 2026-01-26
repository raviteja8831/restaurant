const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../models');

const Order = db.orders;
const Subscription = db.subscription;
const Commission = db.commission;
const Restaurant = db.restaurant;
const AppSettings = db.appSettings;
const Payout = db.payout;

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
        // Check if this is a table booking (not a food order)
        let isTableBooking = false;
        try {
          const TableBooking = db.tableBooking;
          const booking = await TableBooking.findByPk(orderId);
          if (booking) {
            isTableBooking = true;
            console.log(`Found table booking ${orderId} - skipping order creation`);
          }
        } catch (bookingError) {
          console.warn(`Could not find table booking with ID ${orderId}:`, bookingError.message);
        }

        // Only create Order record if it's NOT a table booking
        // Table bookings should stay in tablebookings table, not orders table
        if (!isTableBooking) {
          console.log(`Order ${orderId} not found - creating new order record`);
          order = await Order.create({
            userId: null,
            restaurantId: restaurantId,
            tableId: null,
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
          console.log(`Skipping order creation for table booking ${orderId} - will be handled by table booking controller`);
        }
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
   * Create or get Razorpay fund account for restaurant
   * @param {Object} restaurant - Restaurant object with UPI
   * @returns {Promise<string>} - Fund account ID
   */
  async createOrGetFundAccount(restaurant) {
    try {
      // Check if fund account already exists
      if (restaurant.razorpayFundAccountId) {
        console.log(`Using existing fund account: ${restaurant.razorpayFundAccountId}`);
        return restaurant.razorpayFundAccountId;
      }

      // Validate UPI
      if (!restaurant.upi) {
        throw new Error(`Restaurant ${restaurant.id} does not have UPI configured`);
      }

      console.log(`Creating fund account for restaurant ${restaurant.id} with UPI: ${restaurant.upi}`);

      // Step 1: Create contact
      const contact = await this.razorpay.contacts.create({
        name: restaurant.name,
        email: `restaurant${restaurant.id}@menutha.com`, // Use a dummy email if not available
        contact: '9999999999', // Use actual phone if available in restaurant model
        type: 'vendor',
        reference_id: `restaurant_${restaurant.id}`,
        notes: {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
        }
      });

      console.log(`Contact created: ${contact.id}`);

      // Step 2: Create fund account with UPI
      const fundAccount = await this.razorpay.fundAccount.create({
        contact_id: contact.id,
        account_type: 'vpa', // VPA = Virtual Payment Address (UPI)
        vpa: {
          address: restaurant.upi
        }
      });

      console.log(`Fund account created: ${fundAccount.id}`);

      // Step 3: Save to database
      await restaurant.update({
        razorpayContactId: contact.id,
        razorpayFundAccountId: fundAccount.id,
      });

      console.log(`Saved fund account to database for restaurant ${restaurant.id}`);

      return fundAccount.id;
    } catch (error) {
      console.error('Error creating fund account:', error);
      throw new Error(`Failed to create fund account: ${error.message}`);
    }
  }

  /**
   * Create payout to restaurant
   * @param {number} restaurantId - Restaurant ID
   * @param {number} amount - Amount in INR
   * @param {number} orderId - Order ID
   * @param {string} narration - Description
   * @returns {Promise<Object>} - Payout result
   */
  async createPayout(restaurantId, amount, orderId, narration) {
    try {
      // Get restaurant with fund account
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (!restaurant) {
        throw new Error(`Restaurant ${restaurantId} not found`);
      }

      // Ensure fund account exists
      const fundAccountId = await this.createOrGetFundAccount(restaurant);

      // Create payout record in database (pending)
      const payoutRecord = await Payout.create({
        razorpayFundAccountId: fundAccountId,
        orderId: orderId,
        restaurantId: restaurantId,
        amount: parseFloat(amount.toFixed(2)),
        currency: 'INR',
        mode: 'UPI',
        status: 'pending',
        purpose: 'payout',
        referenceId: `order_${orderId}_${Date.now()}`,
        narration: narration,
        initiatedAt: new Date(),
      });

      console.log(`Payout record created in DB: ID=${payoutRecord.id}, Amount=${amount}`);

      // Create actual Razorpay payout
      try {
        const payout = await this.razorpay.payouts.create({
          account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your Razorpay account number
          fund_account_id: fundAccountId,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          mode: 'UPI',
          purpose: 'payout',
          queue_if_low_balance: true, // Queue if insufficient balance
          reference_id: payoutRecord.referenceId,
          narration: narration,
        });

        console.log(`Razorpay payout created: ${payout.id}`);

        // Update payout record with Razorpay ID and status
        await payoutRecord.update({
          razorpayPayoutId: payout.id,
          status: payout.status, // processing, processed, etc.
          processedAt: payout.status === 'processed' ? new Date() : null,
        });

        return {
          success: true,
          payoutId: payoutRecord.id,
          razorpayPayoutId: payout.id,
          amount: amount,
          status: payout.status,
        };
      } catch (payoutError) {
        // Update database with failure
        await payoutRecord.update({
          status: 'failed',
          failureReason: payoutError.message,
        });

        throw payoutError;
      }
    } catch (error) {
      console.error('Error creating payout:', error);
      throw new Error(`Failed to create payout: ${error.message}`);
    }
  }

  /**
   * Split payment between restaurant and app provider (WITH ACTUAL PAYOUTS)
   * @param {Object} order - Order object with payment details
   * @returns {Promise<Object>} - Payment split result
   */
  async splitPayment(order) {
    try {
      const commission = order.commission || 0;
      const restaurantAmount = (order.total || 0) - commission;

      console.log(`Splitting payment for order ${order.id}: Total=${order.total}, Commission=${commission}, Restaurant=${restaurantAmount}`);

      let restaurantPayout = null;
      let commissionRecord = null;

      // Create payout to restaurant
      if (restaurantAmount > 0) {
        try {
          restaurantPayout = await this.createPayout(
            order.restaurantId,
            restaurantAmount,
            order.id,
            `Payment for order #${order.id}`
          );
          console.log(`Restaurant payout initiated: ${restaurantPayout.razorpayPayoutId}`);
        } catch (payoutError) {
          console.error('Error creating restaurant payout:', payoutError.message);
          // Continue even if payout fails - we'll track it for retry
        }
      }

      // Track commission (app provider keeps this automatically)
      if (commission > 0) {
        try {
          commissionRecord = await Commission.create({
            orderId: order.id,
            restaurantId: order.restaurantId,
            amount: commission,
            percentage: order.commissionPercentage || 2.5,
            status: 'paid',
            hasSubscription: order.hasSubscription,
            paymentMethod: 'razorpay',
            paidDate: new Date(),
            payoutStatus: 'not_applicable', // Commission stays with app owner
          });
          console.log(`Commission record created: ID=${commissionRecord.id}, Amount=${commission}`);
        } catch (commissionError) {
          console.error('Error creating commission record:', commissionError.message);
        }

        // Update order commission status
        await order.update({
          commissionStatus: 'paid',
        });
      }

      return {
        success: true,
        restaurantPayout: restaurantPayout,
        commission: commission,
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
