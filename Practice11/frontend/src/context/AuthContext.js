import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api';  // ← вот этого импорта не хватало!

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // ← setUser теперь определён
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.login({ email, password });
    const { accessToken, refreshToken } = response.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const userResponse = await api.getMe();
    setUser(userResponse.data);

    return response.data;
  };

  const register = async (userData) => {
    return api.register(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};