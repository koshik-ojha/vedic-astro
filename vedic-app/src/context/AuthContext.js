import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setAuthErrorHandler } from '../api/client';
import { login as authLogin, signup as authSignup } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthErrorHandler(() => setUser(null));
    return () => setAuthErrorHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('jwt_token');
        const userData = await SecureStore.getItemAsync('user_data');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch {
        await SecureStore.deleteItemAsync('jwt_token').catch(() => {});
        await SecureStore.deleteItemAsync('user_data').catch(() => {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await authLogin(email, password);
    const token = data.token || data.access_token;
    if (!token) throw new Error('No token received from server');
    await SecureStore.setItemAsync('jwt_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user || { email }));
    setUser(data.user || { email });
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await authSignup(name, email, password);
    const token = data.token || data.access_token;
    if (!token) throw new Error('No token received from server');
    await SecureStore.setItemAsync('jwt_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user || { email, name }));
    setUser(data.user || { email, name });
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('jwt_token').catch(() => {});
    await SecureStore.deleteItemAsync('user_data').catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
