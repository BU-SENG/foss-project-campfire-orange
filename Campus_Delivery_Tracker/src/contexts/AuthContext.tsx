import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type UserRole = 'student' | 'personnel' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock users
const initialMockUsers: (User & { password: string })[] = [
  { id: '1', email: 'student@campus.edu', password: 'student123', name: 'John Student', role: 'student' },
  { id: '2', email: 'personnel@campus.edu', password: 'personnel123', name: 'Jane Personnel', role: 'personnel' },
  { id: '3', email: 'admin@campus.edu', password: 'admin123', name: 'Admin User', role: 'admin' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Keep mockUsers stable across renders
  const mockUsersRef = useRef(initialMockUsers);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('campusDeliveryUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('campusDeliveryUser');
    }
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise(res => setTimeout(res, 500)); // simulate API call

    const foundUser = mockUsersRef.current.find(
      u => u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = foundUser;

    setUser(userWithoutPassword);
    localStorage.setItem('campusDeliveryUser', JSON.stringify(userWithoutPassword));
  };

  const register = async (email: string, password: string, name: string) => {
    await new Promise(res => setTimeout(res, 500)); // simulate API call

    if (mockUsersRef.current.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: String(mockUsersRef.current.length + 1),
      email,
      name,
      role: 'student',
    };

    mockUsersRef.current.push({ ...newUser, password });

    setUser(newUser);
    localStorage.setItem('campusDeliveryUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusDeliveryUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
