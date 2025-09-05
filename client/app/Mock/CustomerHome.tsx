export interface Filter {
  name: string;
  count: number;
}

export interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImage?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  total: string;
}

export interface HistoryItem {
  id: number;
  hotelName: string;
  address: string;
  date: string;
  time: string;
  members: number;
  totalAmount: string;
  items?: OrderItem[];
}

export interface FavoriteItem {
  id: number;
  hotelName: string;
  description: string;
  rating: number;
  status: string;
}

export interface TransactionItem {
  id: number;
  hotelName: string;
  members: number;
  totalAmount: string;
  date: string;
  time: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string | null;
  selected?: boolean;
  quantity?: number;
  category?: string;
}

export interface BuffetData {
  type: string;
  description: string;
  price: number;
  availableTime?: string;
  items?: string[];
}
export interface MenuItemsByCategory {
  category: string;
  items: MenuItem[];
}

export interface HotelOption {
  icon: string;
  label: string;
  route?: string;
}

export interface HotelReview {
  reviewer: string;
  stars: number;
  text: string;
}

export interface HotelDetailData {
  id: number;
  name: string;
  starRating: number;
  address: string;
  image: string;
  options: HotelOption[];
  reviews: HotelReview[];
  averageWaitingTime: string;
  tablesAvailable: number;
}

export interface RestaurantData {
  id: number;
  name: string;
  rating: number;
  type: string;
  address: string;
  description: string;
  status: string;
  waitingTime: string;
}

export const CustomerHome: Filter[] = [
  { name: "Near Me", count: 15 },
  { name: "3 Star Hotel", count: 6 },
  { name: "5 Star Hotel", count: 3 },
  { name: "Waiting Period Less then 5 Min", count: 6 },
  { name: "Waiting Period More then 15 Min", count: 7 },
  { name: "Only Veg Restaurant", count: 1 },
  { name: "Only Non Veg Restaurant", count: 8 },
  { name: "Only Bar & Restaurant", count: 6 },
  { name: "5 Star Rating", count: 2 },
  { name: "Only Buffet", count: 1 },
  { name: "Only Self Service", count: 5 },
  { name: "Only Table Service", count: 9 },
];

export const userData: UserData = {
  firstName: "Praveen",
  lastName: "Jadhav",
  phoneNumber: "9660845632",
  profileImage: undefined,
};

export const historyData: HistoryItem[] = [
  {
    id: 1,
    hotelName: "Sai Hotel (3 Star Hotel)",
    address:
      "No 45 Brigade Plaze First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088",
    date: "04.02.2025",
    time: "9:30 PM",
    members: 5,
    totalAmount: "₹3000",
    items: [
      { name: "Tomato Soup", quantity: 4, price: "₹80", total: "₹320" },
      { name: "Godi Manchuri", quantity: 4, price: "₹120", total: "₹480" },
      { name: "Roti", quantity: 4, price: "₹45", total: "₹180" },
      { name: "Veg Biriyani", quantity: 2, price: "₹180", total: "₹360" },
      { name: "Curd Rice", quantity: 2, price: "₹150", total: "₹300" },
      { name: "Desserts", quantity: 4, price: "₹215", total: "₹860" },
    ],
  },
  {
    id: 2,
    hotelName: "Kamat Hotel",
    address:
      "Mysore Main road Bharat Petrol Station National Highway Bangalore 560088",
    date: "02.02.2025",
    time: "10:00 AM",
    members: 2,
    totalAmount: "₹940",
  },
  {
    id: 3,
    hotelName: "Udupi Kitchen Hotel",
    address:
      "Bellary Main road Bharat Petrol Station National Highway Bangalore 560088",
    date: "25.01.2025",
    time: "2:15 PM",
    members: 4,
    totalAmount: "₹2500",
  },
];

export const favoritesData: FavoriteItem[] = [
  {
    id: 1,
    hotelName: "Sai Hotel (3 Star Hotel)",
    description: "ssssssegegegwegg",
    rating: 5,
    status: "Excellent",
  },
  {
    id: 2,
    hotelName: "Kamat Hotel",
    description: "asdafewqfewqc",
    rating: 5,
    status: "Excellent",
  },
  {
    id: 3,
    hotelName: "Udupi Kitchen Hotel",
    description: "gafsvgregerqverqgrqeggergewg",
    rating: 5,
    status: "Excellent",
  },
];

export const transactionsData: TransactionItem[] = [
  {
    id: 1,
    hotelName: "Sai Hotel (3 Star Hotel)",
    members: 5,
    totalAmount: "₹3000",
    date: "04.02.2025",
    time: "9:30 PM",
  },
  {
    id: 2,
    hotelName: "Kamat Hotel",
    members: 2,
    totalAmount: "₹940",
    date: "02.02.2025",
    time: "10:00 AM",
  },
  {
    id: 3,
    hotelName: "Udupi Kitchen Hotel",
    members: 4,
    totalAmount: "₹2500",
    date: "25.01.2025",
    time: "2:15 PM",
  },
];

// Menu Categories
export const buffetData: BuffetData[] = [
  {
    type: "Breakfast Buffet",
    description: "Poori, All types of Dosa,\nChow Chow Bath, Rice Bath",
    price: 800,
    availableTime: "7:00 AM - 11:00 AM",
    items: [
      "Poori",
      "Masala Dosa",
      "Plain Dosa",
      "Set Dosa",
      "Chow Chow Bath",
      "Rice Bath",
      "Idli",
      "Vada",
      "Coffee/Tea",
    ],
  },
  {
    type: "Lunch Buffet",
    description: "North Indian, South Indian, Chinese Cuisine",
    price: 999,
    availableTime: "12:00 PM - 3:30 PM",
    items: ["Variety of Starters", "Main Course", "Desserts", "Beverages"],
  },
];

export const hotelDetailsData: HotelDetailData[] = [
  {
    id: 1,
    name: "Hotel Sai",
    starRating: 3,
    address:
      "No 45 Brigade Plaze First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    averageWaitingTime: "15 Min",
    tablesAvailable: 3,
    options: [
      {
        icon: "book-outline",
        label: "Menu",
        route: "/menu-list",
      },
      {
        icon: "restaurant-outline",
        label: "Booking table\n(3 TA)",
        route: "/TableDiningScreen",
      },
      {
        icon: "time-outline",
        label: "Avg Waiting time.\n15Min",
      },
    ],
    reviews: [
      {
        reviewer: "Person 1",
        stars: 5,
        text: "One of the best Restaurant in Bangalore Highly Recommended",
      },
      {
        reviewer: "Person 2",
        stars: 5,
        text: "If you want to try Biriyani this the Best Place in Bangalore",
      },
      {
        reviewer: "Person 3",
        stars: 5,
        text: "Best ambiance to chill out with friends and Family. And Food is Great.",
      },
    ],
  },
];

export const menuCategories: MenuCategory[] = [
  {
    id: 1,
    name: "Hot & Cold Beverages",
    icon: "cup",
    image: "bevereage.png",
    count: 12,
  },
  { id: 2, name: "Soups", icon: "food-variant", image: "soup.png", count: 8 },
  {
    id: 3,
    name: "Breakfast",
    icon: "bread-slice",
    image: "breakfast.png",
    count: 15,
  },
  {
    id: 4,
    name: "Starters",
    icon: "food-variant",
    image: "staters.png",
    count: 20,
  },
  {
    id: 5,
    name: "Indian Breads",
    icon: "food-variant",
    image: "indian-bread.png",
    count: 10,
  },
  {
    id: 6,
    name: "Main Course",
    icon: "food",
    image: "main-course.png",
    count: 25,
  },
  { id: 7, name: "Salads", icon: "leaf", image: "salads.png", count: 6 },
  {
    id: 8,
    name: "Ice creams & Desserts",
    icon: "ice-cream",
    image: "ice-cream-sesserts.png",
    count: 12,
  },
];

// Restaurant Data
export const restaurantData: RestaurantData = {
  id: 1,
  name: "Hotel sar",
  rating: 5,
  type: "5-star Hotel",
  address:
    "No 45 Brigade Plaze First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088",
  description: "Premium dining experience with world-class cuisine",
  status: "Open",
  waitingTime: "5-10 min",
};

// Menu Items Data
export const menuItemsData: MenuItemsByCategory[] = [
  {
    category: "Beverages",
    items: [
      {
        id: 1,
        name: "Coffee",
        price: "₹50",
        description: "Hot coffee",
        image: null,
      },
      { id: 2, name: "Tea", price: "₹40", description: "Hot tea", image: null },
      {
        id: 3,
        name: "Cold Coffee",
        price: "₹80",
        description: "Iced coffee",
        image: null,
      },
      {
        id: 4,
        name: "Lemonade",
        price: "₹60",
        description: "Fresh lemonade",
        image: null,
      },
    ],
  },
  {
    category: "Veg Soups",
    items: [
      {
        id: 5,
        name: "Tomato Soup",
        price: "₹80",
        description: "Hot tomato soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 6,
        name: "Mushroom Soup",
        price: "₹90",
        description: "Creamy mushroom soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 7,
        name: "Sweet Corn Soup",
        price: "₹90",
        description: "Sweet corn soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 8,
        name: "Palak Soup",
        price: "₹90",
        description: "Spinach soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 9,
        name: "Rasam Soup",
        price: "₹90",
        description: "South Indian spiced soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 10,
        name: "Roasted Tomato Soup",
        price: "₹110",
        description: "Smoky roasted tomato soup",
        image: null,
        selected: false,
        quantity: 0,
      },
    ],
  },
  {
    category: "Egg Soups",
    items: [
      {
        id: 11,
        name: "Egg Drop Soup",
        price: "₹150",
        description: "Silky Chinese-style egg drop soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 12,
        name: "Egg Creamy Soup",
        price: "₹160",
        description: "Rich and creamy egg soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 13,
        name: "Egg Yolk Soup",
        price: "₹180",
        description: "Egg yolk-based savory soup",
        image: null,
        selected: false,
        quantity: 0,
      },
    ],
  },
  {
    category: "Chicken Soups",
    items: [
      {
        id: 14,
        name: "Creamy Chicken Paste Soup",
        price: "₹280",
        description: "Thick creamy chicken soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 15,
        name: "Chicken Mushroom Soup",
        price: "₹290",
        description: "Chicken and mushroom soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 16,
        name: "Queso Chicken Soup",
        price: "₹290",
        description: "Cheesy chicken soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 17,
        name: "Noodle Chicken Soup",
        price: "₹290",
        description: "Chicken soup with noodles",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 18,
        name: "Chicken Broth Soup",
        price: "₹290",
        description: "Light chicken broth soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 19,
        name: "Chicken Stew Soup",
        price: "₹310",
        description: "Hearty chicken stew soup",
        image: null,
        selected: false,
        quantity: 0,
      },
    ],
  },
  {
    category: "Mutton Soups",
    items: [
      {
        id: 20,
        name: "Creamy Mutton Paste Soup",
        price: "₹480",
        description: "Thick creamy mutton soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 21,
        name: "Mutton Mushroom Soup",
        price: "₹490",
        description: "Mutton and mushroom soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 22,
        name: "Pepper Mutton Soup",
        price: "₹500",
        description: "Spicy black pepper mutton soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 23,
        name: "Noodle Mutton Soup",
        price: "₹590",
        description: "Mutton soup with noodles",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 24,
        name: "Mutton Rasam Soup",
        price: "₹590",
        description: "Tangy mutton rasam soup",
        image: null,
        selected: false,
        quantity: 0,
      },
      {
        id: 25,
        name: "Mutton Bone Soup",
        price: "₹610",
        description: "Rich mutton bone broth",
        image: null,
        selected: false,
        quantity: 0,
      },
    ],
  },
  {
    category: "Breakfast",
    items: [
      {
        id: 26,
        name: "Idli",
        price: "₹60",
        description: "Steamed rice cakes",
        image: null,
      },
      {
        id: 27,
        name: "Dosa",
        price: "₹80",
        description: "Rice and lentil crepe",
        image: null,
      },
      {
        id: 28,
        name: "Puri Bhaji",
        price: "₹70",
        description: "Fried bread with potato curry",
        image: null,
      },
    ],
  },
  {
    category: "Starters",
    items: [
      {
        id: 29,
        name: "Gobi Manchurian",
        price: "₹120",
        description: "Spicy manchurian",
        image: null,
      },
      {
        id: 30,
        name: "Chicken 65",
        price: "₹150",
        description: "Spicy chicken starter",
        image: null,
      },
      {
        id: 31,
        name: "Paneer Tikka",
        price: "₹130",
        description: "Grilled cottage cheese",
        image: null,
      },
    ],
  },
  {
    category: "Breads",
    items: [
      {
        id: 32,
        name: "Roti",
        price: "₹45",
        description: "Whole wheat bread",
        image: null,
      },
      {
        id: 33,
        name: "Naan",
        price: "₹50",
        description: "Leavened bread",
        image: null,
      },
      {
        id: 34,
        name: "Paratha",
        price: "₹55",
        description: "Layered flatbread",
        image: null,
      },
    ],
  },
  {
    category: "Main Course",
    items: [
      {
        id: 35,
        name: "Veg Biriyani",
        price: "₹180",
        description: "Aromatic rice dish",
        image: null,
      },
      {
        id: 36,
        name: "Chicken Curry",
        price: "₹200",
        description: "Spicy chicken curry",
        image: null,
      },
      {
        id: 37,
        name: "Dal Fry",
        price: "₹90",
        description: "Lentil curry",
        image: null,
      },
      {
        id: 38,
        name: "Curd Rice",
        price: "₹150",
        description: "Yogurt rice",
        image: null,
      },
    ],
  },
  {
    category: "Salads",
    items: [
      {
        id: 39,
        name: "Garden Salad",
        price: "₹80",
        description: "Fresh vegetable salad",
        image: null,
      },
      {
        id: 40,
        name: "Caesar Salad",
        price: "₹120",
        description: "Classic caesar salad",
        image: null,
      },
    ],
  },
  {
    category: "Desserts",
    items: [
      {
        id: 41,
        name: "Ice Cream",
        price: "₹80",
        description: "Vanilla ice cream",
        image: null,
      },
      {
        id: 42,
        name: "Gulab Jamun",
        price: "₹60",
        description: "Sweet dessert balls",
        image: null,
      },
      {
        id: 43,
        name: "Rasgulla",
        price: "₹70",
        description: "Bengali sweet",
        image: null,
      },
    ],
  },
];

export const orderData = [
  { id: 1, status: "Served", item: "Tomato Soup", qty: 4, price: 80 },
  { id: 2, status: "Ready", item: "Godi Manchuri", qty: 4, price: 120 },
  { id: 3, status: "Preparing", item: "Roti", qty: 4, price: 45 },
  { id: 4, status: "Preparing", item: "Veg Biriyani", qty: 2, price: 180 },
  { id: 5, status: "Waiting", item: "Curd Rice", qty: 2, price: 150 },
  { id: 6, status: "Waiting", item: "Desserts", qty: 4, price: 215 },
];
