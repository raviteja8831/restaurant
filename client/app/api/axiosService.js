import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api.constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if available
axiosInstance.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;
