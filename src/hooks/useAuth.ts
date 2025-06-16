
import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'guest';
  permissions: string[];
}

const users: { [key: string]: { password: string; user: User } } = {
  admin: {
    password: '123456',
    user: {
      id: '1',
      username: 'Admin',
      role: 'admin',
      permissions: ['create', 'read', 'update', 'delete', 'manage_users']
    }
  },
  guest: {
    password: '123456',
    user: {
      id: '2',
      username: 'Guest',
      role: 'guest',
      permissions: ['read']
    }
  }
};

const AUTH_STORAGE_KEY = 'inventory-auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        console.log('Loaded stored user:', userData);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    console.log('Login attempt:', { username, password });
    const userKey = username.toLowerCase().trim();
    const userData = users[userKey];
    
    console.log('Looking for user key:', userKey);
    console.log('Available users:', Object.keys(users));
    console.log('Found user data:', userData);
    
    if (userData && userData.password === password) {
      console.log('Login successful for:', userData.user);
      setUser(userData.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData.user));
      return true;
    }
    
    console.log('Login failed - invalid credentials');
    return false;
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  return {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
};
