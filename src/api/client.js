/**
 * NOTE: This file configures the central Axios instance for all API calls.
 * Key Features:
 * - Centralized Base URL: All requests go to a single configured endpoint.
 * - Automatic Token Injection: The request interceptor automatically attaches the user's
 *   auth token from AsyncStorage to every outgoing request.
 * - Global 401 Handling: The response interceptor detects token expiration (401 status)
 *   and triggers a global logout via a callback, preventing circular dependencies.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://eazyride-api.onrender.com/api';

const client = axios.create({ baseURL: API_BASE, timeout: 15000 });

let onUnauthorizedCallback = () => {};
export const setOnUnauthorizedCallback = (callback) => {
  onUnauthorizedCallback = callback;
};

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.log('API Interceptor: Detected 401 Unauthorized. Triggering global logout.');
      onUnauthorizedCallback();
    }
    return Promise.reject(err);
  }
);

export default client;
