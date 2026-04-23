import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://vedic-astro-backend-rox2.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 70000,
  headers: { 'Content-Type': 'application/json' },
});

let _onAuthError = null;
export const setAuthErrorHandler = (handler) => { _onAuthError = handler; };

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
      await SecureStore.deleteItemAsync('jwt_token').catch(() => {});
      await SecureStore.deleteItemAsync('user_data').catch(() => {});
      if (_onAuthError) _onAuthError();
    }
    return Promise.reject(error);
  }
);

export default API;
