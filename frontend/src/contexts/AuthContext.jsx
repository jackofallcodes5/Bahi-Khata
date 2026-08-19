import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check token not expired
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        // token is picked up automatically by the axiosInstance interceptor
        // Fetch full profile so name/email/phone are available after refresh
        axios.get('/api/auth/me')
          .then(res => {
            const d = res.data.data;
            setUser({ id: d.id, role: d.roleName, name: d.name, email: d.email, phone: d.phone, profile_pic: d.profile_pic });
          })
          .catch(() => {
            localStorage.removeItem('token');
            // token removed from localStorage; interceptor will no longer attach it
          })
          .finally(() => setLoading(false));
      } catch (err) {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone, password) => {
    const res = await axios.post('/api/auth/login', { phone, password });
    const { token, data } = res.data;
    localStorage.setItem('token', token);
    // token stored in localStorage; interceptor picks it up on next request
    setUser({ id: data.id, role: data.role, name: data.name, email: data.email, phone: data.phone, profile_pic: data.profile_pic });
    return data;
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    // token removed from localStorage; interceptor will no longer attach it
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
