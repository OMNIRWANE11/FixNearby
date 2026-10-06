import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fn_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.auth.me();
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      const { token: jwtToken, user: userData } = res.data;
      localStorage.setItem('fn_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.error?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.data) {
      const { token: jwtToken, user: registeredUser } = res.data;
      localStorage.setItem('fn_token', jwtToken);
      setToken(jwtToken);
      setUser(registeredUser);
      return registeredUser;
    }
    throw new Error(res.error?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('fn_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isTechnician: user?.role === 'technician',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

