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
    const { userId, selectedTables } = req.body;

    if (
      !userId ||
      // !restaurantId ||
      !selectedTables ||
      !Array.isArray(selectedTables)
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields or invalid format",
      });
    }

    const currentDate = new Date();
    // Set booking end time to 45 minutes from now
    console.log(currentDate.getTime());
    const endTime = new Date(currentDate.getTime() + 45 * 60000);
    console.log(endTime.getTime());
    // Create bookings for each selected table
    const bookingPromises = selectedTables.map((table) => {
      return TableBooking.create({
        userId,
        restaurantId: table.restaurantId,
        tableId: table.id || table.tableId,
        starttime: currentDate.getTime().toString(),
        endtime: endTime.getTime().toString(),
        amount: 50,
        // status: "active",
      });
    });

    const bookings = await Promise.all(bookingPromises);

    return res.status(201).json({
      success: true,
      message: "Table bookings created successfully",
      data: bookings,
    });
  } catch (error) {
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
