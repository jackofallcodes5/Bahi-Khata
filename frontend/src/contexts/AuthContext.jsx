import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Fetch full profile so name/email/phone are available after refresh
        axios.get('/api/auth/me')
          .then(res => {
            const d = res.data.data;
            setUser({ id: d.id, role: d.roleName, name: d.name, email: d.email, phone: d.phone, profile_pic: d.profile_pic });
          })
          .catch(() => {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
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
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({ id: data.id, role: data.role, name: data.name, email: data.email, phone: data.phone, profile_pic: data.profile_pic });
    return data;
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
