const db = require("../models");
const TableBooking = db.tableBooking;
const RestaurantTable = db.restaurantTable;
const { Op } = require("sequelize");

// Get available tables for a restaurant considering current bookings
exports.getAvailableTables = async (req, res) => {
  try {
    const { restaurantId, userId } = req.params;
    const currentDate = new Date();

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    // Get user's bookings if userId is provided
    let userBookings = [];
    if (userId) {
      userBookings = await TableBooking.findAll({
        attributes: ["id", "tableId", "starttime", "endtime"],
        where: {
          userId: userId,
          restaurantId: restaurantId,
          endtime: {
            [Op.gt]: currentDate.getTime(),
          },
        },
        order: [["endtime", "DESC"]],
      });
    }
    console.log("User Bookings:", userBookings);

    // First get all tables for the restaurant
    const allTables = await RestaurantTable.findAll({
      where: {
        restaurantId: restaurantId,
      },
      include: [
        {
          model: TableBooking,
          as: "bookings",
          required: false,
          where: {
            endtime: {
              [Op.gt]: currentDate.getTime(),
            },
          },
        },
      ],
      order: [["id", "ASC"]], // Order by id in ascending order
    });
    // Then determine availability based on current bookings
    const allBookings = await TableBooking.findAll({
      attributes: ["tableId"],
      where: {
        restaurantId: restaurantId,
        endtime: {
          [Op.gt]: currentDate.getTime(),
        },
      },
      order: [["endTime", "DESC"]],
    });
    const tableIds = allBookings.map((booking) => booking.tableId);
    console.log("Booked Table IDs:", tableIds);
    const availableTablesList = await RestaurantTable.findAll({
      where: {
        restaurantId: restaurantId,
        id: {
          [Op.notIn]: tableIds,
        },
      },
      order: [["id", "ASC"]], // Order by id in ascending order
    });

    // Process the results

    const tablebookings = await db.tableBooking.count({
      where: {
        restaurantId: restaurantId,
        endtime: {
          [Op.gt]: currentDate.getTime(),
        },
      },
      // attributes: ["endtime"],
    });
    const userBookingsData = userBookings.map((booking) => ({
      bookingId: booking.id,
      tableId: booking.tableId,
      startTime: booking.startTime,
      endTime: booking.endTime,

      // status: booking.status,
    }));

    return res.status(200).json({
      success: true,
      data: {
        tables: allTables,
        totalTables: allTables.length,
        availableTables: allTables.length - tablebookings,
        reservedTables: tablebookings,
        userBookings: userBookingsData,
        availableTablesList: availableTablesList,
      },
    });
  } catch (error) {
    console.error("Error in getAvailableTables:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving available tables",
      error: error.message,
    });
  }
};

// Create new table booking
exports.create = async (req, res) => {
  try {
    console.log('=== TABLE BOOKING REQUEST ===');
    console.log('Full Request Body:', JSON.stringify(req.body, null, 2));
    
    const { userId, selectedTables, status } = req.body;

    console.log('UserId:', userId, 'Type:', typeof userId);
    console.log('SelectedTables:', JSON.stringify(selectedTables));
    console.log('Status:', status);
    
    if (selectedTables && Array.isArray(selectedTables)) {
      console.log('✓ SelectedTables Length:', selectedTables.length);
      selectedTables.forEach((table, idx) => {
        console.log(`  Table ${idx}:`, JSON.stringify(table));
      });
    }

    // Validation
    if (!userId) {
      console.error('❌ UserId missing');
      return res.status(400).json({
        success: false,
        message: "UserId is required",
      });
    }

    if (!selectedTables || !Array.isArray(selectedTables) || selectedTables.length === 0) {
      console.error('❌ SelectedTables validation failed');
      return res.status(400).json({
        success: false,
        message: "selectedTables must be a non-empty array",
        details: {
          received: selectedTables,
          isArray: Array.isArray(selectedTables),
          length: Array.isArray(selectedTables) ? selectedTables.length : 0,
        }
      });
    }

    const currentDate = new Date();
    const startTime = currentDate.getTime();
    const endTime = new Date(startTime + 45 * 60000).getTime();
    
    console.log('Booking times - Start:', startTime, 'End:', endTime);
    
    // Create bookings for each selected table
    const bookingPromises = selectedTables.map((table) => {
      if (!table.restaurantId || !table.id) {
        throw new Error(`Invalid table data: missing restaurantId or id. Received: ${JSON.stringify(table)}`);
      }
      
      const booking = {
        userId,
        restaurantId: table.restaurantId,
        tableId: table.id || table.tableId,
        starttime: startTime.toString(),
        endtime: endTime.toString(),
        amount: 50,
        status: status || "booked",
      };
      console.log('Creating booking:', JSON.stringify(booking));
      return TableBooking.create(booking);
    });

    const bookings = await Promise.all(bookingPromises);

    console.log('✅ Bookings created successfully:', bookings.length);
    return res.status(201).json({
      success: true,
      message: "Table bookings created successfully",
      bookingId: bookings[0].id,  // Return the first booking ID for payment processing
      data: bookings,
    });
  } catch (error) {
    console.error('❌ Table booking creation error:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Error creating table bookings",
      error: error.message,
    });
  }
};

// Get all table bookings
exports.findAll = async (req, res) => {
  try {
    const bookings = await TableBooking.findAll();
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving table bookings",
      error: error.message,
    });
  }
};

// Get single table booking by ID
exports.findOne = async (req, res) => {
  try {
    const booking = await TableBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Table booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving table booking",
      error: error.message,
    });
  }
};

// Update table booking by ID
exports.update = async (req, res) => {
  try {
    const booking = await TableBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Table booking not found",
      });
    }
    await booking.update(req.body);
    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating table booking",
      error: error.message,
    });
  }
};

// Delete table booking by ID
exports.delete = async (req, res) => {
  try {
    const booking = await TableBooking.findByPk(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Table booking not found",
      });
    }
    await booking.destroy();
    return res.status(200).json({
      success: true,
      message: "Table booking deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting table booking",
      error: error.message,
    });
  }
};
exports.findTableBookingSummary = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const tables = await db.restaurantTable.count({
      where: {
        restaurantId: restaurantId,
      },
    });
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const tablebookings = await db.tableBooking.count({
      where: {
        restaurantId: restaurantId,
        endtime: {
          [Op.gt]: currentDate.getTime(),
        },
      },
      // attributes: ["endtime"],
    });
    /* console.log(
      "End times:",
      tablebookings.map((booking) => booking.endtime)
    ); */

    const bookingCount = tablebookings.length;
    console.log(currentDate);
    const obj = {
      totalTables: tables,
      totalBookings: tablebookings,
      availableTables: tables - tablebookings,
    };

    return res.status(200).json({
      success: true,
      data: obj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving table booking summary",
      error: error.message,
    });
  }
};

// Get pending bookings for manager verification
exports.getPendingBookings = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const currentDate = new Date();
    const pendingBookings = await TableBooking.findAll({
      where: {
        restaurantId: restaurantId,
        status: "booked",
        endtime: {
          [Op.gt]: currentDate.getTime(),
        },
      },
      include: [
        {
          model: RestaurantTable,
          as: "table",
          attributes: ["id", "tableName", "capacity"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: pendingBookings,
    });
  } catch (error) {
    console.error("Error in getPendingBookings:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving pending bookings",
      error: error.message,
    });
  }
};

// Manager verify payment and update status
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await TableBooking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Table booking not found",
      });
    }

    if (booking.status === "payment_completed") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified for this booking",
      });
    }

    await booking.update({ status: "payment_completed" });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};
