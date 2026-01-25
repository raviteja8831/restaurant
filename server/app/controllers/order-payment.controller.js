// Order/Menu Payment with Razorpay
const RazorpayService = require('../services/RazorpayService');
const db = require("../models");

const Order = db.orders;
const Restaurant = db.restaurant;

const razorpayService = new RazorpayService();

/**
 * Create order with Razorpay payment
 * POST /api/order/create-with-payment
 */
exports.createOrderWithPayment = async (req, res) => {
  try {
    const { userId, restaurantId, tableId, total, orderItems } = req.body;

    // Validate required fields
    if (!userId || !restaurantId || !total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'userId, restaurantId, and valid total amount are required',
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

    // Create order with payment pending status
    const order = await Order.create({
      restaurantId: restaurantId,
      userId: userId,
      total: parseFloat(total),
      status: 'PAYMENT_PENDING',
      tableId: tableId || null,
    });

    // Create order items if provided
    if (orderItems && Array.isArray(orderItems) && orderItems.length > 0) {
      try {
        const orderProducts = orderItems.map((item) => ({
          orderId: order.id,
          menuitemId: item.id || item.menuitemId,
          quantity: item.quantity || 1,
          comments: item.comments || '',
        }));

        await db.orderProducts.bulkCreate(orderProducts);
      } catch (itemError) {
        console.error('Error creating order items:', itemError);
        // Continue even if items creation fails - order is created
      }
    }

    // Create Razorpay order for the menu order
    try {
      const result = await razorpayService.createOrder(
        restaurantId,
        order.id, // Use order ID as reference
        total,
        `Order for ${restaurant.name} - Order #${order.id}`
      );

      // Save razorpayOrderId immediately
      await order.update({
        razorpayOrderId: result.razorpayOrder.id,
      });

      res.status(201).json({
        success: true,
        message: 'Order created - proceed with payment',
        data: {
          orderId: order.id,
          razorpayOrderId: result.razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: total,
          currency: 'INR',
          restaurantId: restaurantId,
          itemCount: orderItems ? orderItems.length : 0,
          commission: result.commission,
          commissionPercentage: result.commission > 0 ? 2.5 : 0,
          hasSubscription: result.hasSubscription,
          transactionId: result.transaction.id,
        },
      });
    } catch (paymentError) {
      // Keep the order but mark for manual follow-up
      console.error('Payment order creation failed:', paymentError);
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating order with payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order payment',
      error: error.message,
    });
  }
};

/**
 * Verify and confirm order payment
 * POST /api/order/verify-payment
 */
exports.verifyOrderPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required',
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

    // Update order with payment details
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status to confirmed
    await order.update({
      status: 'CONFIRMED',
      paymentMethod: 'razorpay',
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
    });

    // Get order items count
    const orderItems = await db.orderProducts.count({
      where: { orderId: orderId },
    });

    res.status(200).json({
      success: true,
      message: 'Order payment verified and confirmed',
      data: {
        orderId: order.id,
        restaurantId: order.restaurantId,
        userId: order.userId,
        total: order.total,
        itemCount: orderItems,
        status: 'CONFIRMED',
        paymentMethod: 'razorpay',
      },
    });
  } catch (error) {
    console.error('Error verifying order payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify order payment',
      error: error.message,
    });
  }
};

/**
 * Handle order payment failure
 * POST /api/order/payment-failed
 */
exports.orderPaymentFailed = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, errorCode, errorDescription } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required',
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status to failed (keep order for records)
    await order.update({
      status: 'PAYMENT_FAILED',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrderId || null,
    });

    res.status(200).json({
      success: true,
      message: 'Order payment failure recorded',
      data: {
        orderId: orderId,
        restaurantId: order.restaurantId,
        status: 'PAYMENT_FAILED',
        errorCode: errorCode || 'unknown',
        errorDescription: errorDescription || 'Payment declined',
      },
    });
  } catch (error) {
    console.error('Error handling order payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};

/**
 * Get order payment status
 * GET /api/order/:orderId/payment-status
 */
exports.getOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        restaurantId: order.restaurantId,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod || 'not_set',
        razorpayOrderId: order.razorpayOrderId || null,
        razorpayPaymentId: order.razorpayPaymentId || null,
      },
    });
  } catch (error) {
    console.error('Error getting order payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order payment status',
      error: error.message,
    });
  }
};

/**
 * Retry payment for failed order
 * POST /api/order/:orderId/retry-payment
 */
exports.retryOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status !== 'PAYMENT_FAILED') {
      return res.status(400).json({
        success: false,
        message: 'Only failed orders can retry payment',
        currentStatus: order.status,
      });
    }

    // Update status back to payment pending
    await order.update({
      status: 'PAYMENT_PENDING',
    });

    // Create new Razorpay order
    try {
      const restaurant = await Restaurant.findByPk(order.restaurantId);
      const result = await razorpayService.createOrder(
        order.restaurantId,
        order.id,
        order.total,
        `Retry: Order for ${restaurant.name} - Order #${order.id}`
      );

      res.status(200).json({
        success: true,
        message: 'Order ready for payment retry',
        data: {
          orderId: order.id,
          razorpayOrderId: result.razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: order.total,
          currency: 'INR',
          transactionId: result.transaction.id,
        },
      });
    } catch (paymentError) {
      // Revert status
      await order.update({ status: 'PAYMENT_FAILED' });
      throw paymentError;
    }
  } catch (error) {
    console.error('Error retrying order payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry order payment',
      error: error.message,
    });
  }
};
