import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, signup as apiSignup } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('jwt_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    await SecureStore.setItemAsync('jwt_token', data.access_token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user || { email }));
    setUser(data.user || { email });
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await apiSignup(name, email, password);
    await SecureStore.setItemAsync('jwt_token', data.access_token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(data.user || { email, name }));
    setUser(data.user || { email, name });
    return data;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
