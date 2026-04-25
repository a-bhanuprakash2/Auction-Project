
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial mock user data
const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'John Seller',
    email: 'seller@example.com',
    role: 'seller',
    avatar: 'https://i.pravatar.cc/150?u=seller'
  },
  {
    id: '2',
    name: 'Jane Bidder',
    email: 'bidder@example.com',
    role: 'bidder',
    avatar: 'https://i.pravatar.cc/150?u=bidder'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('auctionUsers');
    return savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('auctionUsers', JSON.stringify(users));
  }, [users]);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const user = users.find(u => u.email === email && u.role === role);
        
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(user));
          resolve();
        } else {
          reject(new Error('Invalid credentials or user not found'));
        }
      }, 1000);
    });
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
          reject(new Error('User already exists'));
        } else {
          const newUser: User = {
            id: `user_${Date.now()}`,
            name,
            email,
            role,
            avatar: `https://i.pravatar.cc/150?u=${role}`
          };
          
          setUsers(prevUsers => [...prevUsers, newUser]);
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          resolve();
        }
      }, 1000);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
