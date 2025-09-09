import api from "../api/api";
import { MENU_API } from "../constants/menuApi";
import { showApiError } from "../services/alertService";

// Get all menus with their items
export const getMenusWithItems = async (restaurantId) => {
  // alert(restaurantId);
  try {
    const res = await api.get(`/api/menus/with-items/${restaurantId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
// Get all items based on menu
export const getitemsbasedonmenu = async (menuId) => {
  try {
    const res = await api.get(`/api/menus/items/${menuId}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

// Save user allotted menu items (bulk)
export const saveUserMenuItems = async (userId, menuitemIds) => {
  try {
    // Send selectedUserId in the payload as well
    const res = await api.post(`/api/users/${userId}/allotted-menuitems`, {
      menuitemIds,
      userId,
    });
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
    const res = await api.put(MENU_API.UPDATE_STATUS_BULK, {
      menuitemIds,
      status,
    });
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
