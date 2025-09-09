import axios from 'axios';

export async function fetchReviews(restaurantId) {
  const res = await axios.get(`http://localhost:8080/api/reviews?restaurantId=${restaurantId}`);
  return res.data;
}
