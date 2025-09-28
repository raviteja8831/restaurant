const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.roles = require("./role.model.js")(sequelize, Sequelize);

db.users = require("./user.model.js")(sequelize, Sequelize);
db.customer = require("./customer.model.js")(sequelize, Sequelize);
db.restaurant = require("./restaurant.model.js")(sequelize, Sequelize);
db.restaurantUser = require("./restaurantuser.model.js")(sequelize, Sequelize);
db.menu = require("./menu.model.js")(sequelize, Sequelize);
db.menuItem = require("./menuitem.model.js")(sequelize, Sequelize);
db.restaurantTable = require("./restauranttable.model.js")(
  sequelize,
  Sequelize
);
db.restaurantReview = require("./restaurantreview.model.js")(
  sequelize,
  Sequelize
);
db.buffet = require("./buffet.model.js")(sequelize, Sequelize);

db.orders = require("./order.model.js")(sequelize, Sequelize);
db.orderStatus = require("./orderStatus.model.js")(sequelize, Sequelize);


db.buffetOrder = require("./buffetOrder.model.js")(sequelize, Sequelize);
db.tableBooking = require("./tablebooking.model.js")(sequelize, Sequelize);
db.message = require("./message.model.js")(sequelize, Sequelize);

db.userFavorite = require("./user.favourite.model.js")(sequelize, Sequelize);
db.restaurantReview = require("./restaurantreview.model.js")(
  sequelize,
  Sequelize
);


db.announcement = require("./announcement.model.js")(sequelize, Sequelize);
db.orderProducts = require("./orderproducts.model.js")(sequelize, Sequelize);
db.userMenuItem = require("./user_menuitem.model.js")(sequelize, Sequelize);
db.restaurantReview.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "reviewedRestaurant",
});
db.restaurantReview.belongsTo(db.users, {
  foreignKey: "userId",
  as: "reviewer",
});
db.buffetOrder.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});
db.buffetOrder.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.menu.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "menuRestaurant",
});
db.restaurant.hasMany(db.menu, { foreignKey: "restaurantId", as: "menus" });

// Removed duplicate associations for orderProducts and orders

// Orders, OrderProducts, Menu, MenuItem associations
db.orders.hasMany(db.orderProducts, {
  foreignKey: "orderId",
  as: "orderProducts",
});
db.orderProducts.belongsTo(db.orders, { foreignKey: "orderId", as: "order" });
db.menu.hasMany(db.menuItem, { foreignKey: "menuId", as: "menuItems" });
db.menuItem.belongsTo(db.menu, { foreignKey: "menuId", as: "menu" });
// Associate orderProducts (orderproduct) with menuItem (menuitem)
db.orderProducts.belongsTo(db.menuItem, {
  foreignKey: "menuitemId",
  as: "menuitem",
});
db.menuItem.hasMany(db.orderProducts, {
  foreignKey: "menuitemId",
  as: "orderProducts",
});
// Order <-> Restauranttable association
db.orders.belongsTo(db.restaurantTable, { foreignKey: "tableId", as: "table" });
db.restaurantTable.hasMany(db.orders, { foreignKey: "tableId", as: "orders" });

// Order Status associations
db.orderProducts.belongsTo(db.orderStatus, {
  foreignKey: "status",
  as: "orderStatus",
});
// db.orderStatus.hasMany(db.orders, { foreignKey: "statusId", as: "orders" });

// Many-to-many: restaurantUser <-> menuItem through userMenuItem
db.restaurantUser.belongsToMany(db.menuItem, {
  through: db.userMenuItem,
  foreignKey: "userId",
  otherKey: "menuitemId",
  as: "allottedMenuItems",
});
db.menuItem.belongsToMany(db.restaurantUser, {
  through: db.userMenuItem,
  foreignKey: "menuitemId",
  otherKey: "userId",
  as: "allottedUsers",
});

// UserFavorite associations
db.userFavorite.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "ratedRestaurant",
});

db.restaurant.hasMany(db.userFavorite, {
  foreignKey: "restaurantId",
  as: "favoritedBy",
});

module.exports = db;

// Associations
// Removed duplicate association for restaurantReview and restaurant with alias 'restaurant'
db.restaurantTable.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});
db.restaurant.hasMany(db.restaurantTable, {
  foreignKey: "restaurantId",
  as: "tables",
});
db.restaurantUser.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});
db.restaurant.hasMany(db.restaurantUser, {
  foreignKey: "restaurantId",
  as: "restaurantUsers",
});
db.restaurantUser.belongsTo(db.roles, { foreignKey: "role_id", as: "role" });
db.roles.hasMany(db.restaurantUser, {
  foreignKey: "role_id",
  as: "restaurantUsers",
});

// RestaurantRating associations
// db.restaurantReview.belongsTo(db.restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
db.restaurant.hasMany(db.restaurantReview, {
  foreignKey: "restaurantId",
  as: "restaurantReviews",
});
db.restaurantReview.belongsTo(db.users, { foreignKey: "userId", as: "user" });
db.users.hasMany(db.restaurantReview, {
  foreignKey: "userId",
  as: "userReviews",
});

db.users.belongsTo(db.roles, {
  foreignKey: "role_id",
  as: "role",
});

db.users.hasMany(db.orders, {
  foreignKey: "userId",
  as: "orders",
});
db.orders.belongsTo(db.users, {
  foreignKey: "userId",
  as: "users",
});

// Add orders-restaurant association
db.orders.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "orderRestaurant",
});
db.restaurant.hasMany(db.orders, {
  foreignKey: "restaurantId",
  as: "orders",
});


db.roles.hasMany(db.users, {
  foreignKey: "role_id",
  as: "users",
});

// Customer associations
db.customer.belongsTo(db.roles, {
  foreignKey: "role_id",
  as: "role",
});

db.customer.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.users.hasOne(db.customer, {
  foreignKey: "userId",
  as: "customerProfile",
});
db.chefLogin = require("./chefLogin.model.js")(sequelize, Sequelize);

db.buffet.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

db.buffet.hasMany(db.buffetOrder, {
  foreignKey: "buffetId",
  as: "orders",
});

// ChefLogin associations
db.chefLogin.belongsTo(db.restaurantUser, {
  foreignKey: "chefId",
  as: "chef",
});

db.chefLogin.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});

db.restaurantUser.hasMany(db.chefLogin, {
  foreignKey: "chefId",
  as: "chefLogins",
});

db.restaurant.hasMany(db.chefLogin, {
  foreignKey: "restaurantId",
  as: "chefLogins",
});
// A
// Table Booking associations
db.tableBooking.belongsTo(db.restaurant, {
  foreignKey: "restaurantId",
  as: "restaurant",
});
db.restaurant.hasMany(db.tableBooking, {
  foreignKey: "restaurantId",
  as: "tableBookings",
});

db.tableBooking.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});
db.users.hasMany(db.tableBooking, {
  foreignKey: "userId",
  as: "tableBookings",
});

db.tableBooking.belongsTo(db.restaurantTable, {
  foreignKey: "tableId",
  as: "table",
});
db.restaurantTable.hasMany(db.tableBooking, {
  foreignKey: "tableId",
  as: "bookings",
});
db.message.belongsTo(db.restaurantUser, { as: 'fromUser', foreignKey: 'fromUserId' });
db.message.belongsTo(db.restaurantUser, { as: 'toUser', foreignKey: 'toUserId' });
db.message.belongsTo(db.roles, { as: 'fromRole', foreignKey: 'fromRoleId' });
db.message.belongsTo(db.roles, { as: 'toRole', foreignKey: 'toRoleId' });
