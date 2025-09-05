import api from '../api/api';
import { MENU_API } from '../constants/menuApi';
import { showApiError } from '../services/alertService';

export const addMenuItem = async (data) => {
  try {
    const res = await api.post(MENU_API.ADDITEM, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Bulk status update for menu items
export const updateMenuItemsStatus = async (menuitemIds, status) => {
  try {
    const res = await api.put(MENU_API.UPDATE_STATUS_BULK, { menuitemIds, status });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
