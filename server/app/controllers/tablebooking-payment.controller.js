// Table Booking Payment with Razorpay
const RazorpayService = require('../services/RazorpayService');
const db = require("../models");

const TableBooking = db.tableBooking;
const RestaurantTable = db.restaurantTable;
const Restaurant = db.restaurant;
const Order = db.orders;

const razorpayService = new RazorpayService();

/**
 * Create table booking with Razorpay payment
 * POST /api/tablebooking/create-with-payment
 */
exports.createTableBookingWithPayment = async (req, res) => {
  try {
    const { userId, restaurantId, selectedTables, amount, starttime, endtime } = req.body;

    // Validate required fields
    if (!userId || !restaurantId || !selectedTables || !Array.isArray(selectedTables) || !amount) {
      return res.status(400).json({
        success: false,
        message: 'userId, restaurantId, selectedTables array, and amount are required',
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

    // Create table bookings with pending payment status
    const bookingPromises = selectedTables.map((table) => {
      return TableBooking.create({
        userId: userId,
        restaurantId: restaurantId,
        tableId: table.id || table.tableId,
        starttime: starttime || new Date().getTime().toString(),
        endtime: endtime || new Date(new Date().getTime() + 45 * 60000).getTime().toString(),
        amount: amount / selectedTables.length, // Split amount among tables
        status: 'payment_pending',
      });
    });

    const bookings = await Promise.all(bookingPromises);

    // Create Razorpay order for the total booking amount
    try {
      const result = await razorpayService.createOrder(
        restaurantId,
        bookings[0].id, // Use first booking ID as reference
        amount,
        `Table Booking for ${restaurant.name} - ${selectedTables.length} table(s)`
      );

      // Store razorpay order ID in all bookings for tracking
      await Promise.all(bookings.map(b =>
        b.update({ razorpayOrderId: result.razorpayOrder.id })
      ));

      res.status(201).json({
        success: true,
        message: 'Table booking created - proceed with payment',
        data: {
          bookingIds: bookings.map(b => b.id),
          razorpayOrderId: result.razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: amount,
          currency: 'INR',
          restaurantId: restaurantId,
          tables: selectedTables.length,
          transactionId: result.transaction.id,
        },
      });
    } catch (paymentError) {
      // Cleanup bookings if payment order creation fails
      await Promise.all(bookings.map(b => b.destroy()));
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating table booking with payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create table booking payment',
      error: error.message,
    });
  }
};

/**
 * Verify and confirm table booking payment
 * POST /api/tablebooking/verify-payment
 */
exports.verifyTableBookingPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, signature } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !signature) {
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

    // Update booking with payment details
    const booking = await TableBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found',
      });
    }

    // Update booking status to confirmed
    await booking.update({
      status: 'booked',
      razorpayOrderId: razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId,
    });

    // Find all related bookings (same restaurant and user, same time)
    const relatedBookings = await TableBooking.findAll({
      where: {
        restaurantId: booking.restaurantId,
        userId: booking.userId,
        starttime: booking.starttime,
        status: 'payment_pending',
      },
    });

    // Update all related bookings to confirmed
    await Promise.all(
      relatedBookings.map(b =>
        b.update({
          status: 'booked',
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: razorpayPaymentId,
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Table booking payment verified and confirmed',
      data: {
        bookingIds: relatedBookings.map(b => b.id),
        restaurantId: booking.restaurantId,
        userId: booking.userId,
        tables: relatedBookings.length,
        amount: booking.amount * relatedBookings.length,
        status: 'booked',
      },
    });
  } catch (error) {
    console.error('Error verifying table booking payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify table booking payment',
      error: error.message,
    });
  }
};

/**
 * Handle table booking payment failure
 * POST /api/tablebooking/payment-failed
 */
exports.tableBookingPaymentFailed = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required',
      });
    }

    const booking = await TableBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found',
      });
    }

    // Find and delete all related pending bookings
    const relatedBookings = await TableBooking.findAll({
      where: {
        restaurantId: booking.restaurantId,
        userId: booking.userId,
        starttime: booking.starttime,
        status: 'payment_pending',
      },
    });

    await Promise.all(relatedBookings.map(b => b.destroy()));

    res.status(200).json({
      success: true,
      message: 'Table booking payment failed and bookings cancelled',
      bookingIds: relatedBookings.map(b => b.id),
    });
  } catch (error) {
    console.error('Error handling table booking payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure',
      error: error.message,
    });
  }
};

/**
 * Get table booking payment status
 * GET /api/tablebooking/:bookingId/payment-status
 */
exports.getTableBookingPaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await TableBooking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Table booking not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking.id,
        restaurantId: booking.restaurantId,
        userId: booking.userId,
        tableId: booking.tableId,
        amount: booking.amount,
        starttime: booking.starttime,
        endtime: booking.endtime,
        status: booking.status,
        razorpayOrderId: booking.razorpayOrderId || null,
        razorpayPaymentId: booking.razorpayPaymentId || null,
      },
    });
  } catch (error) {
    console.error('Error getting table booking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get table booking payment status',
      error: error.message,
    });
  }
};
