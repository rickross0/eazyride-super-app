/**
 * NOTE: This context is the brain of the user session management.
 * Key Features:
 * - Session Persistence: Loads user token and data from AsyncStorage on app start.
 * - Login/Logout Logic: Encapsulates the API calls for login and the process of
 *   storing/clearing session data.
 * - API Integration: Sets up the 401 interceptor callback and clears all cached
 *   API data (`queryClient.clear()`) on logout for a clean state.
 * - Global State: Provides `user`, `isAuthenticated`, and `isLoading` to all components.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import client, { setOnUnauthorizedCallback } from '../api/client';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setOnUnauthorizedCallback(() => logout(false));

    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedToken && storedUserData) {
          const parsedUser = JSON.parse(storedUserData);
          setUser(parsedUser);
          setToken(storedToken);
          client.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.error("Failed to load session", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const hydrateSession = async (newToken, userData) => {
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    client.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  };

  const login = async (credentials) => {
    setIsLoggingIn(true);
    try {
      const { data } = await client.post('/auth/login', credentials);
      const responseData = data.data || data;
      const { accessToken: newToken, user: userData } = responseData;

      await hydrateSession(newToken, userData);
      
      Toast.show({ type: 'success', text1: `Welcome back, ${userData?.firstName || 'User'}!` });

    } catch (e) {
      const errorMessage = e.response?.data?.error || e.response?.data?.message || 'Invalid credentials. Please try again.';
      Toast.show({ type: 'error', text1: 'Login Failed', text2: errorMessage });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async (notifyBackend = true) => {
    queryClient.clear();

    if (notifyBackend) {
      try {
        await client.delete('/auth/fcm-token');
      } catch (e) {
        console.error("Failed to clear FCM token on backend", e);
      }
    }

    await AsyncStorage.multiRemove(['token', 'userData']);
    setUser(null);
    setToken(null);
    delete client.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, isLoggingIn, login, logout, hydrateSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
