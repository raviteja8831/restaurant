// Default menu items to be created when a new restaurant is registered
// These are based on the standard menu categories from the database
// This avoids dependency on existing database records which may be deleted
module.exports = [
  {
    name: "Hot & Cold Beverages",
    status: true,
    icon: "beverage"
  },
  {
    name: "Soups",
    status: false,
    icon: "soups"
  },
  {
    name: "Breakfast",
    status: true,
    icon: "breakfast"
  },
  {
    name: "Starters",
    status: true,
    icon: "starters"
  },
  {
    name: "Indian Breads",
    status: true,
    icon: "ibreads"
  },
  {
    name: "Main Course",
    status: true,
    icon: "mc"
  },
  {
    name: "Salads",
    status: true,
    icon: "salads"
  },
  {
    name: "Ice creams & Deserts",
    status: true,
    icon: "iced"
  },
  {
    name: "Liquor",
    status: true,
    icon: "liquor"
  }
];
