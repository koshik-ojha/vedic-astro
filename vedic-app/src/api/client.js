import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://vedic-astro-backend-rox2.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwt_token');
    }
    return Promise.reject(error);
  }
);

export default API;
