import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchMe = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (e) {
      console.error(e);
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token, fetchMe]);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        await fetchMe();
        navigate('/dashboard');
      } else {
        setError('Login succeeded but no token received. Please try again.');
      }
    } catch (e) {
      console.error('Login error:', e);
      if (e.response) {
        // Server responded with error
        setError(e.response.data?.message || 'Login failed. Please check your credentials.');
      } else if (e.request) {
        // Request made but no response (network error)
        setError('Unable to reach server. Please check your connection and ensure the backend is running.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      const res = await api.post('/auth/signup', { name, email, password });
      if (res.data && res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('token', res.data.token);
        await fetchMe();
        navigate('/dashboard');
      } else {
        setError('Signup succeeded but no token received. Please try again.');
      }
    } catch (e) {
      console.error('Signup error:', e);
      if (e.response) {
        // Server responded with error
        setError(e.response.data?.message || 'Signup failed. Please check your information.');
      } else if (e.request) {
        // Request made but no response (network error)
        setError('Unable to reach server. Please check your connection and ensure the backend is running.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    refetchUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


