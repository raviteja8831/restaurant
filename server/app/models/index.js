// Association calls must be after db is fully initialized
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
db.message = require("./message.model.js")(sequelize, Sequelize);

db.restaurantType = require("./restauranttype.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.restaurant = require("./restaurant.model.js")(sequelize, Sequelize);
db.restaurantUser = require("./restaurantuser.model.js")(sequelize, Sequelize);
db.buffetOrder = require("./buffetOrder.model.js")(sequelize, Sequelize);
db.restaurantReview = require("./restaurantreview.model.js")(
  sequelize,
  Sequelize
);

db.restaurantRating = require("./restaurantrating.model.js")(
  sequelize,
  Sequelize
);
db.userFavorite = require("./user.favourite.model.js")(sequelize, Sequelize);
db.restaurantReview = require("./restaurantreview.model.js")(
  sequelize,
  Sequelize
);
db.orders = require("./order.model.js")(sequelize, Sequelize);
db.menu = require("./menu.model.js")(sequelize, Sequelize);
db.menuItem = require("./menuitem.model.js")(sequelize, Sequelize);
db.restaurantTable = require("./restauranttable.model.js")(
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
db.restaurant.belongsTo(db.restaurantType, {
  foreignKey: "typeId",
  as: "type",
});
db.restaurantType.hasMany(db.restaurant, {
  foreignKey: "typeId",
  as: "restaurants",
});
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

// User ratings/favorites association
db.users.hasMany(db.restaurantRating, {
  foreignKey: "userId",
  as: "ratings",
});
db.restaurantRating.belongsTo(db.users, {
  foreignKey: "userId",
  as: "user",
});

db.roles.hasMany(db.users, {
  foreignKey: "role_id",
  as: "users",
});
