import { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('medilink_user')) || null);

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/login`, { email, password });
    setUser(res.data);
    localStorage.setItem('medilink_user', JSON.stringify(res.data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medilink_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};