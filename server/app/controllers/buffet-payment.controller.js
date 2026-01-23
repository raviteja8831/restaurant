// Buffet Booking Payment with Razorpay
const RazorpayService = require('../services/RazorpayService');
const db = require("../models");

const BuffetOrder = db.buffetOrder;
const Buffet = db.buffet;
const Restaurant = db.restaurant;

const razorpayService = new RazorpayService();

/**
 * Create buffet order with Razorpay payment
 * POST /api/buffet/create-with-payment
 */
exports.createBuffetOrderWithPayment = async (req, res) => {
  try {
    const { userId, restaurantId, buffetId, persons, totalAmount } = req.body;

    // Validate required fields
    if (!userId || !restaurantId || !persons || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'userId, restaurantId, persons, and totalAmount are required',
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

    // Check if buffet exists (if buffetId provided)
    if (buffetId) {
      const buffet = await Buffet.findByPk(buffetId);
      if (!buffet) {
        return res.status(404).json({
          success: false,
          message: 'Buffet not found',
        });
      }
    }

    // Create buffet order with pending payment status
    const buffetOrder = await BuffetOrder.create({
      userId: userId,
      restaurantId: restaurantId,
      buffetId: buffetId || null,
      persons: persons,
      price: totalAmount / persons, // Price per person
      totalAmount: totalAmount,
      status: 'payment_pending',
    });

    // Create Razorpay order for buffet booking
    try {
      const result = await razorpayService.createOrder(
        restaurantId,
        buffetOrder.id, // Use buffet order ID as reference
        totalAmount,
        `Buffet Order for ${restaurant.name} - ${persons} person(s)`
      );

      res.status(201).json({
        success: true,
        message: 'Buffet order created - proceed with payment',
        data: {
          buffetOrderId: buffetOrder.id,
          razorpayOrderId: result.razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: totalAmount,
          currency: 'INR',
          restaurantId: restaurantId,
          persons: persons,
          pricePerPerson: totalAmount / persons,
          transactionId: result.transaction.id,
        },
      });
    } catch (paymentError) {
      // Cleanup order if payment order creation fails
      await buffetOrder.destroy();
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating buffet order with payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create buffet order payment',
      error: error.message,
    });
  }
};

/**
 * Verify and confirm buffet order payment
 * POST /api/buffet/verify-payment
 */
exports.verifyBuffetOrderPayment = async (req, res) => {
  try {
    const { buffetOrderId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

    if (!buffetOrderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
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

    // Update buffet order with payment details
    const buffetOrder = await BuffetOrder.findByPk(buffetOrderId);
    if (!buffetOrder) {
      return res.status(404).json({
        success: false,
        message: 'Buffet order not found',
      });
    }

    await buffetOrder.update({
      status: 'booked',
      razorpayPaymentId: razorpayPaymentId,
      razorpayOrderId: razorpayOrderId,
    });

    res.status(200).json({
      success: true,
      message: 'Buffet order payment verified and confirmed',
      data: {
        buffetOrderId: buffetOrder.id,
        restaurantId: buffetOrder.restaurantId,
        userId: buffetOrder.userId,
        persons: buffetOrder.persons,
        totalAmount: buffetOrder.totalAmount,
        status: 'booked',
      },
    });
  } catch (error) {
    console.error('Error verifying buffet order payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify buffet order payment',
      error: error.message,
    });
  }
};

/**
 * Handle buffet order payment failure
 * POST /api/buffet/payment-failed
 */
exports.buffetOrderPaymentFailed = async (req, res) => {
  try {
    const { buffetOrderId, razorpayOrderId } = req.body;

    if (!buffetOrderId) {
      return res.status(400).json({
        success: false,
        message: 'buffetOrderId is required',
      });
    }

    const buffetOrder = await BuffetOrder.findByPk(buffetOrderId);
    if (!buffetOrder) {
      return res.status(404).json({
        success: false,
        message: 'Buffet order not found',
      });
    }

    // Delete the buffet order if payment fails
    await buffetOrder.destroy();

    res.status(200).json({
      success: true,
      message: 'Buffet order payment failed and order cancelled',
      buffetOrderId: buffetOrderId,
    });
  } catch (error) {
    console.error('Error handling buffet order payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};
