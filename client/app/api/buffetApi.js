
import axios from 'axios';
const BASE_URL = 'http://localhost:8080';

export const getBuffetDetails = async (restaurantId, token) => {
  const res = await axios.get(`${BASE_URL}/api/buffetdetails?restaurantId=${restaurantId}`,
    { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const saveBuffetDetails = async (buffet, token) => {
  const res = await axios.post(`${BASE_URL}/api/buffetdetails`, buffet,
    { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
