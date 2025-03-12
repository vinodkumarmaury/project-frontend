'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImage?: string; // Add this optional property
}

// Add this near the top of your file
interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  theme: string;
  dataExportFormat: string;
  dataRetention: string;
  autoSave: boolean;
}

// And for account settings
interface AccountSettings {
  name: string;
  email: string;
  profileImage: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void; // Add this line to your auth-context.tsx
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: false,
    pushNotifications: false,
    language: 'en',
    theme: 'system',
    dataExportFormat: 'csv',
    dataRetention: '30days',
    autoSave: true
  });
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    name: '',
    email: '',
    profileImage: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.post('/api/signin', { email, password });
      
      // Save token
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      // Fetch user profile
      const userProfile = await api.get('/api/profile');
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      // First check if the response is not ok
      if (!response.ok) {
        const errorData = await response.json();
        // Throw the specific error message from the backend
        throw new Error(errorData.detail || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Set auth token and user info
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setUser({ username, email });
      
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      // Re-throw the error to be caught by the component
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (prevUser) {
        const updatedUser = { ...prevUser, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};