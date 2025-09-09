import api from '../api/api';

export async function fetchQRCodes(restaurantId) {
  const res = await api.get(`/api/qrcodes?restaurantId=${restaurantId}`);
  return res.data;
}



export async function createQRCode({ name, restaurantId }) {
  // Only send name and restaurantId; backend will generate imageUrl
  const res = await api.post('/api/qrcodes', { name, restaurantId });
  return res.data;
}

export async function fetchQRCodeOrders(qrcodeId, period) {
  const res = await api.get(`/api/qrcodes/${qrcodeId}/orders?period=${period}`);
  return res.data;
}
