import api from '../api';
import { CHEF_API } from '../constants/chefApi';
import { showApiError } from '../services/messagingService';

export const fetchChefOrders = async () => {
  try {
    const res = await api.get(CHEF_API.ORDERS);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const fetchChefStats = async () => {
  try {
    const res = await api.get(CHEF_API.STATS);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const fetchChefMessages = async () => {
  try {
    const res = await api.get(CHEF_API.MESSAGES);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const sendChefMessage = async (data) => {
  try {
    await api.post('/chef/messages', data);
    return true;
  } catch (e) {
    return false;
  }
};
