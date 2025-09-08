
import api from '../api/api';
import { MENU_API } from '../constants/menuApi';
import { showApiError } from '../services/alertService';

// Get all menus with their items
export const getMenusWithItems = async () => {
  try {
    const res = await api.get('/api/menus/with-items');
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Save user allotted menu items (bulk)
export const saveUserMenuItems = async (userId, menuitemIds) => {
  try {
    // Ensure menuitemIds is a flat array
    const flatMenuitemIds = Array.isArray(menuitemIds) ? menuitemIds.flat() : [];
    const res = await api.post(`/api/users/${userId}/allotted-menuitems`, { menuitemIds: flatMenuitemIds, userId });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

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
