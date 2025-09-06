export interface User {
  id: number;
  firstname: string;
  lastname: string;
  phone: string;
  allottedMenuItems: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
}

export interface TopOrder {
  name: string;
  count: number;
}

export interface TodaysOrder {
  id: number;
  time: string;
  items: { name: string; qty: number }[];
}

export interface UserDashboard {
  user: User;
  todayLoginTime: string;
  totalOrders: number;
  totalOrdersAll: number;
  topOrders: TopOrder[];
  todaysOrders: TodaysOrder[];
}
