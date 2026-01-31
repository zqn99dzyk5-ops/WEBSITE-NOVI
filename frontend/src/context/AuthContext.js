import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const api = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
  }, [token]);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const decoded = jwtDecode(savedToken);
          if (decoded.exp * 1000 > Date.now()) {
            setToken(savedToken);
            const response = await axios.get(`${API}/auth/me`, {
              headers: { Authorization: `Bearer ${savedToken}` }
            });
            setUser(response.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, name, captchaToken) => {
    const response = await axios.post(`${API}/auth/register`, { 
      email, 
      password, 
      name, 
      captcha_token: captchaToken 
    });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    // Check if user was referred by someone and set referrer
    const affiliateRef = localStorage.getItem('affiliate_ref');
    const affiliateExpires = localStorage.getItem('affiliate_ref_expires');
    if (affiliateRef && affiliateExpires && Date.now() < parseInt(affiliateExpires)) {
      try {
        await axios.post(`${API}/affiliate/set-referrer?affiliate_user_id=${affiliateRef}`, {}, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        // Clear the affiliate cookie after setting
        localStorage.removeItem('affiliate_ref');
        localStorage.removeItem('affiliate_ref_expires');
      } catch (err) {
        console.log('Failed to set referrer:', err);
      }
    }
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, api, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};