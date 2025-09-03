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

export const CustomerHome:Filter[] = 
     [
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
  firstName: 'Praveen',
  lastName: 'Jadhav',
  phoneNumber: '9660845632',
  profileImage: undefined,
};

export const historyData: HistoryItem[] = [
  {
    id: 1,
    hotelName: 'Sai Hotel (3 Star Hotel)',
    address: 'No 45 Brigade Plaze First floor Near VRL Bus Stand Opp Movieland cinema hall Bangalore 560088',
    date: '04.02.2025',
    time: '9:30 PM',
    members: 5,
    totalAmount: '₹3000',
    items: [
      { name: 'Tomato Soup', quantity: 4, price: '₹80', total: '₹320' },
      { name: 'Godi Manchuri', quantity: 4, price: '₹120', total: '₹480' },
      { name: 'Roti', quantity: 4, price: '₹45', total: '₹180' },
      { name: 'Veg Biriyani', quantity: 2, price: '₹180', total: '₹360' },
      { name: 'Curd Rice', quantity: 2, price: '₹150', total: '₹300' },
      { name: 'Desserts', quantity: 4, price: '₹215', total: '₹860' },
    ]
  },
  {
    id: 2,
    hotelName: 'Kamat Hotel',
    address: 'Mysore Main road Bharat Petrol Station National Highway Bangalore 560088',
    date: '02.02.2025',
    time: '10:00 AM',
    members: 2,
    totalAmount: '₹940',
  },
  {
    id: 3,
    hotelName: 'Udupi Kitchen Hotel',
    address: 'Bellary Main road Bharat Petrol Station National Highway Bangalore 560088',
    date: '25.01.2025',
    time: '2:15 PM',
    members: 4,
    totalAmount: '₹2500',
  }
];

export const favoritesData: FavoriteItem[] = [
  {
    id: 1,
    hotelName: 'Sai Hotel (3 Star Hotel)',
    description: 'ssssssegegegwegg',
    rating: 5,
    status: 'Excellent'
  },
  {
    id: 2,
    hotelName: 'Kamat Hotel',
    description: 'asdafewqfewqc',
    rating: 5,
    status: 'Excellent'
  },
  {
    id: 3,
    hotelName: 'Udupi Kitchen Hotel',
    description: 'gafsvgregerqverqgrqeggergewg',
    rating: 5,
    status: 'Excellent'
  }
];

export const transactionsData: TransactionItem[] = [
  {
    id: 1,
    hotelName: 'Sai Hotel (3 Star Hotel)',
    members: 5,
    totalAmount: '₹3000',
    date: '04.02.2025',
    time: '9:30 PM'
  },
  {
    id: 2,
    hotelName: 'Kamat Hotel',
    members: 2,
    totalAmount: '₹940',
    date: '02.02.2025',
    time: '10:00 AM'
  },
  {
    id: 3,
    hotelName: 'Udupi Kitchen Hotel',
    members: 4,
    totalAmount: '₹2500',
    date: '25.01.2025',
    time: '2:15 PM'
  }
];
