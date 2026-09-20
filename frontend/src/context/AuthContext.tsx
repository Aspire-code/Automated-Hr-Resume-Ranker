import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import API from '../services/api';

interface AuthContextType {
  user: any;
  login: (credentials: any) => Promise<any>;
  register: (formData: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(() => {
    const userId = localStorage.getItem('user_id');
    const name = localStorage.getItem('user_name');
    const email = localStorage.getItem('user_email');
    return userId ? { user_id: userId, name, email } : null;
  });

  const login = async (credentials: any) => {
    const response = await API.post('/auth/login', credentials);
    const userData = response.data.user;

    localStorage.setItem('user_id', userData.user_id);
    localStorage.setItem('user_name', userData.name);
    localStorage.setItem('user_email', userData.email);

    setUser(userData);
    return response.data;
  };

  const register = async (formData: any) => {
    const response = await API.post('/auth/register', formData);
    return response.data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}