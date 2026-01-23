const RazorpayService = require('../services/RazorpayService');
const db = require('../models');

const Order = db.orders;
const Transaction = db.transaction;
const Restaurant = db.restaurant;

const razorpayService = new RazorpayService();

/**
 * Create a new Razorpay order for payment
 * POST /api/razorpay/create-order
 */
exports.createOrder = async (req, res) => {
  try {
    const { restaurantId, orderId, amount, description } = req.body;

    // Validate required fields
    if (!restaurantId || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId, orderId, and amount are required',
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Create Razorpay order
    const result = await razorpayService.createOrder(
      restaurantId,
      orderId,
      amount,
      description || `Order #${orderId} - ${restaurant.name}`
    );

    res.status(201).json({
      success: true,
      message: 'Razorpay order created successfully',
      data: {
        razorpayOrderId: result.razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        restaurantId: restaurantId,
        orderId: orderId,
        hasSubscription: result.hasSubscription,
        commission: result.commission,
        commissionPercentage: 2.5,
        transactionId: result.transaction.id,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay order',
      error: error.message,
    });
  }
};

/**
 * Verify payment after successful transaction
 * POST /api/razorpay/verify-payment
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

    // Validate required fields
    if (!razorpayOrderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId, razorpayPaymentId, and signature are required',
      });
    }

    // Verify payment signature
    const isSignatureValid = razorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      signature
    );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    // Handle payment success
    const result = await razorpayService.handlePaymentSuccess(
      razorpayOrderId,
      razorpayPaymentId,
      signature
    );

    // Update order status to CONFIRMED if needed
    const transaction = result.transaction;
    if (transaction.orderId) {
      const order = await Order.findByPk(transaction.orderId);
      if (order) {
        await order.update({ status: 'CONFIRMED' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and confirmed successfully',
      data: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        restaurantId: transaction.restaurantId,
        amount: transaction.amount,
        status: transaction.status,
        commission: transaction.commission,
        commissionStatus: transaction.commissionStatus,
        hasSubscription: transaction.hasSubscription,
        paymentId: razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
    });
  }
};

/**
 * Handle payment failure
 * POST /api/razorpay/payment-failed
 */
exports.paymentFailed = async (req, res) => {
  try {
    const { razorpayOrderId, errorCode, errorDescription } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'razorpayOrderId is required',
      });
    }

    // Handle payment failure
    const result = await razorpayService.handlePaymentFailure(razorpayOrderId);

    res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      data: {
        transactionId: result.transaction.id,
        orderId: result.transaction.orderId,
        status: result.transaction.status,
        errorCode: errorCode || 'unknown',
        errorDescription: errorDescription || 'Payment failed',
      },
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};

/**
 * Get transaction details
 * GET /api/razorpay/transaction/:transactionId
 */
exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId is required',
      });
    }

    const result = await razorpayService.getTransactionDetails(transactionId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error getting transaction details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transaction details',
      error: error.message,
    });
  }
};

/**
 * Get all transactions for a restaurant
 * GET /api/razorpay/restaurant/:restaurantId/transactions
 */
exports.getRestaurantTransactions = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, dateFrom, dateTo } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId is required',
      });
    }

    const transactions = await razorpayService.getRestaurantTransactions(
      restaurantId,
      { status, dateFrom, dateTo }
    );

    // Calculate summary
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions,
        summary: {
          totalTransactions: transactions.length,
          completedTransactions: completedTransactions,
          totalAmount: totalAmount,
          totalCommission: totalCommission,
          averageTransaction: transactions.length > 0 ? totalAmount / transactions.length : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error getting restaurant transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message,
    });
  }
};

/**
 * Get commission summary for admin
 * GET /api/razorpay/admin/commission-summary
 */
exports.getCommissionSummary = async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    const summary = await razorpayService.getCommissionSummary({
      status,
      dateFrom,
      dateTo,
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error getting commission summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get commission summary',
      error: error.message,
    });
  }
};

/**
 * Calculate commission for a transaction
 * GET /api/razorpay/transaction/:transactionId/commission
 */
exports.calculateCommission = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'transactionId is required',
      });
    }

    const commissionDetails = await razorpayService.calculateCommission(transactionId);

    res.status(200).json({
      success: true,
      data: commissionDetails,
    });
  } catch (error) {
    console.error('Error calculating commission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate commission',
      error: error.message,
    });
  }
};

/**
 * Webhook to handle Razorpay events
 * POST /api/razorpay/webhook
 */
exports.webhook = async (req, res) => {
  try {
    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Webhook Event: ${event}`);

    if (event === 'payment.authorized') {
      // Payment authorized but not captured
      console.log('Payment authorized:', payload.payment.entity);
    } else if (event === 'payment.captured') {
      // Payment captured successfully
      const paymentEntity = payload.payment.entity;
      console.log('Payment captured:', paymentEntity);

      // Find and update transaction if needed
      const transaction = await Transaction.findOne({
        where: { razorpayPaymentId: paymentEntity.id },
      });

      if (transaction && transaction.status === 'pending') {
        await transaction.update({ status: 'completed' });
      }
    } else if (event === 'payment.failed') {
      // Payment failed
      const paymentEntity = payload.payment.entity;
      console.log('Payment failed:', paymentEntity);

      // Find and update transaction
      const transaction = await Transaction.findOne({
        where: { razorpayPaymentId: paymentEntity.id },
      });

      if (transaction) {
        await transaction.update({ status: 'failed' });
      }
    } else if (event === 'order.paid') {
      // Order fully paid
      console.log('Order paid:', payload.order.entity);
    }

    // Acknowledge webhook
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message,
    });
  }
};

/**
 * Get payment status
 * GET /api/razorpay/payment/:paymentId/status
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required',
      });
    }

    const paymentDetails = await razorpayService.getPaymentDetails(paymentId);

    res.status(200).json({
      success: true,
      data: {
        paymentId: paymentDetails.id,
        status: paymentDetails.status,
        amount: paymentDetails.amount / 100, // Convert paise to INR
        currency: paymentDetails.currency,
        method: paymentDetails.method,
        createdAt: paymentDetails.created_at,
        acquirerId: paymentDetails.acquirer_id,
      },
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message,
    });
  }
};
