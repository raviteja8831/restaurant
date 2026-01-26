const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const app = express();

// Log environment variables for debugging
console.log("Server starting...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "SET" : "NOT SET");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "SET" : "NOT SET");

// Always set CORS headers for all responses (including errors)
const allowAllCORS = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
};
// Parse requests of content-type - application/json
app.use(express.json());
// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Place CORS and custom middleware after body parsers
app.use(allowAllCORS);

// Register routes after middleware

require("./app/routes/order.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/menu.routes.js")(app);
require("./app/routes/menuitem.routes.js")(app);
require("./app/routes/table.routes.js")(app);
require("./app/routes/restaurant.routes.js")(app);
require("./app/routes/qrcode.routes.js")(app);
require("./app/routes/review.routes.js")(app);
require("./app/routes/favorites.routes.js")(app);
require("./app/routes/manager.routes.js")(app);
require("./app/routes/chef.routes.js")(app);
require("./app/routes/bufferOrder.routes.js")(app);
require("./app/routes/customer.routes.js")(app);
require("./app/routes/buffetdetails.routes.js")(app);
// require("./app/routes/tablebooking.routes.js")(app);
require("./app/routes/tablebooking.routes.js")(app);
require("./app/routes/debug.routes.js")(app);
require("./app/routes/subscription.routes.js")(app);
require("./app/routes/appsettings.routes.js")(app);
require("./app/routes/otp.routes.js")(app);
require("./app/routes/razorpay.routes.js")(app);
require("./app/routes/subscription-payment.routes.js")(app);
require("./app/routes/tablebooking-payment.routes.js")(app);
require("./app/routes/buffet-payment.routes.js")(app);
require("./app/routes/order-payment.routes.js")(app);

require("dotenv").config();
var corsOptions = {
  origin: "*",
};
require("./app/routes/qrcode.routes.js")(app);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");

    // Validate timezone configuration
    try {
      const [results] = await db.sequelize.query("SELECT NOW() as server_time, @@session.time_zone as session_tz, @@global.time_zone as global_tz");
      console.log("\n🕐 MySQL Timezone Configuration:");
      console.log("   Session Timezone:", results[0].session_tz);
      console.log("   Global Timezone:", results[0].global_tz);
      console.log("   Current Server Time:", results[0].server_time);

      // Verify IST offset
      const istOffset = results[0].session_tz;
      if (istOffset === '+05:30') {
        console.log("✅ MySQL timezone is correctly set to IST (+05:30)\n");
      } else {
        console.warn("⚠️  WARNING: MySQL session timezone is not set to IST. Expected: +05:30, Got:", istOffset, "\n");
      }
    } catch (err) {
      console.error("❌ Failed to validate timezone:", err.message);
    }
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// Serve images with CORS headers
app.use(
  "/assets/images",
  express.static(__dirname + "/assets/images", {
    setHeaders: function (res, path, stat) {
      res.set("Access-Control-Allow-Origin", "*");
    },
  })
);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to  application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
