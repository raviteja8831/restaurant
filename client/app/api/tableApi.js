import api from '../api';
import { TABLE_API } from '../constants/tableApi';
import { showApiError } from '../services/messagingService';

export const fetchTables = async () => {
  try {
    const res = await api.get(TABLE_API.LIST);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const addTable = async (tableData) => {
  try {
    const res = await api.post(TABLE_API.ADD, tableData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const updateTable = async (id, tableData) => {
  try {
    const res = await api.put(`${TABLE_API.UPDATE}/${id}`, tableData);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};

export const deleteTable = async (id) => {
  try {
    const res = await api.delete(`${TABLE_API.DELETE}/${id}`);
    return res.data;
  } catch (error) {
    showApiError(error);
    throw error;
  }
};
