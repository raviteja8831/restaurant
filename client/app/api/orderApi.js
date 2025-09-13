import axiosService from "./axiosService";
import { API_BASE_URL } from "../constants/constants";
import { ORDER_API } from "../constants/orderApi";

export const createOrder = async (orderData) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}${ORDER_API.CREATE_ORDER}`,
      orderData
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const deleteOrderItems = async (data) => {
  try {
    const res = await axiosService.post(
      `${API_BASE_URL}${ORDER_API.DELETE_ORDER_ITEMS}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getOrderItemCount = async (restaurantId, userId) => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}/orders/pending/${restaurantId}/${userId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
export const getOrderItemList = async (orderId, userId) => {
  try {
    const res = await axiosService.get(
      `${API_BASE_URL}/orders/selected/items/${orderId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, data) => {
  try {
    const res = await axiosService.put(
      `${API_BASE_URL}/orders/${orderId}`,
      data
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const res = await axiosService.delete(
      `${API_BASE_URL}${ORDER_API.DELETE_ORDER}/${orderId}`
    );
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
