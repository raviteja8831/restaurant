// Subscription Payment with Razorpay
const RazorpayService = require('../services/RazorpayService');
const db = require("../models");

const Subscription = db.subscription;
const Restaurant = db.restaurant;

const razorpayService = new RazorpayService();

/**
 * Create subscription with Razorpay payment
 * POST /api/subscription/create-with-payment
 */
exports.createSubscriptionWithPayment = async (req, res) => {
  try {
    const { restaurantId, amount, startDate, endDate } = req.body;

    // Validate required fields
    if (!restaurantId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId and amount are required',
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

    // Create subscription record with pending status
    const subscription = await Subscription.create({
      restaurantId: restaurantId,
      amount: amount,
      startDate: startDate || new Date(),
      endDate: endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
      upiId: 'razorpay', // Mark as Razorpay payment
      paymentStatus: 'pending',
      transactionId: null,
    });

    // Create Razorpay order for subscription (directly, without Order table)
    try {
      const razorpayOrder = await razorpayService.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `subscription_${subscription.id}_${restaurantId}`,
        description: `Subscription for ${restaurant.name}`,
        notes: {
          restaurantId: restaurantId,
          subscriptionId: subscription.id,
          type: 'subscription',
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`Created Razorpay order ${razorpayOrder.id} for subscription ${subscription.id}`);

      // Store razorpayOrderId in subscription for tracking
      await subscription.update({
        razorpayOrderId: razorpayOrder.id,
      });

      res.status(201).json({
        success: true,
        message: 'Subscription created - proceed with payment',
        data: {
          subscriptionId: subscription.id,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: amount,
          currency: 'INR',
          restaurantId: restaurantId,
        },
      });
    } catch (paymentError) {
      // Cleanup subscription if payment order creation fails
      await subscription.destroy();
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating subscription with payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription payment',
      error: error.message,
    });
  }
};

/**
 * Verify and confirm subscription payment
 * POST /api/subscription/verify-payment
 */
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    console.log('📝 Subscription payment verification request:', JSON.stringify(req.body, null, 2));

    const { subscriptionId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

    if (!subscriptionId || !razorpayOrderId || !razorpayPaymentId || !signature) {
      console.error('❌ Missing required fields:', { subscriptionId, razorpayOrderId, razorpayPaymentId, signature: signature ? 'present' : 'missing' });
      return res.status(400).json({
        success: false,
        message: 'All payment details are required',
      });
    }

    console.log('🔐 Verifying payment signature...');
    // Verify payment signature
    const isSignatureValid = razorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      signature
    );

    if (!isSignatureValid) {
      console.error('❌ Invalid signature for subscription payment');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Payment verification failed.',
      });
    }

    console.log('✅ Signature valid, updating subscription...');

    // Update subscription with payment details
    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      console.error(`❌ Subscription not found: ${subscriptionId}`);
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    console.log(`📝 Found subscription: ${subscription.id}, current status: ${subscription.paymentStatus}`);

    await subscription.update({
      paymentStatus: 'completed',
      transactionId: razorpayPaymentId,
    });

    console.log(`✅ Subscription ${subscription.id} payment verified and activated!`);

    res.status(200).json({
      success: true,
      message: 'Subscription payment verified and activated',
      data: {
        subscriptionId: subscription.id,
        restaurantId: subscription.restaurantId,
        amount: subscription.amount,
        status: subscription.paymentStatus,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    });
  } catch (error) {
    console.error('❌ Error verifying subscription payment:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription payment',
      error: error.message,
    });
  }
};

/**
 * Handle subscription payment failure
 * POST /api/subscription/payment-failed
 */
exports.subscriptionPaymentFailed = async (req, res) => {
  try {
    const { subscriptionId, razorpayOrderId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'subscriptionId is required',
      });
    }

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Delete the subscription if payment fails
    await subscription.destroy();

    res.status(200).json({
      success: true,
      message: 'Subscription payment failed and subscription deleted',
      subscriptionId: subscriptionId,
    });
  } catch (error) {
    console.error('Error handling subscription payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};
