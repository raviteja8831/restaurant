import api from '../api';
import { USER_API } from '../constants/userApi';
import { showApiError } from '../services/messagingService';

export const registerUser = async (data) => {
  try {
    const res = await api.post(USER_API.REGISTER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post(USER_API.LOGIN, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const res = await api.get(`${USER_API.PROFILE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const registerRestaurantUser = async (data) => {
  try {
    const res = await api.post(USER_API.REGISTER_RESTAURANT_USER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const loginRestaurantUser = async (data) => {
  try {
    const res = await api.post(USER_API.LOGIN_RESTAURANT_USER, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await api.put(`${USER_API.PROFILE}/${id}`, data);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`${USER_API.PROFILE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
