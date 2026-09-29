import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitlog_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fitlog_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('fitlog_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          localStorage.setItem('fitlog_user', JSON.stringify(userData));
        } catch (err) {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const { token: newToken, userId, fullName, email, role } = res;
    const userData = { id: userId, fullName, email, role };

    localStorage.setItem('fitlog_token', newToken);
    localStorage.setItem('fitlog_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const registeredUser = await authApi.register(data);
    // After registration, auto-login or return user
    return registeredUser;
  };

  const handleOAuthSuccess = async (newToken) => {
    localStorage.setItem('fitlog_token', newToken);
    setToken(newToken);
    const userData = await authApi.getMe();
    localStorage.setItem('fitlog_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('fitlog_token');
    localStorage.removeItem('fitlog_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        setUser,
        handleOAuthSuccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
