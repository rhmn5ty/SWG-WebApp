"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  username: string;
  email: string;
  password: string;
  role: 'database' | 'admin' | 'customer' | 'hr' | 'finance';
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string, callback: () => void) => void;
  logout: (callback: () => void) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dummyUsers: User[] = [
  { username: 'hr', email: 'hr@gdemo.com', password: 'Gu@rd1um', role: 'hr' },
  { username: 'finance', email: 'finance@gdemo.com', password: 'Gu@rd1um', role: 'finance' },
  { username: 'customer', email: 'customer@gdemo.com', password: 'Gu@rd1um', role: 'customer' },
  { username: 'admin', email: 'admin@gdemo.com', password: 'Gu@rd1um', role: 'admin' },
  { username: 'database', email: 'database@gdemo.com', password: 'Gu@rd1um', role: 'database' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, callback: () => void) => {
    const foundUser = dummyUsers.find((u) => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      callback();
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = (callback: () => void) => {
    setUser(null);
    callback();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
