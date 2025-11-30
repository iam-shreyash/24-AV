import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getStoredAuth } from './Login';

type User = {
  id: string;
  email: string;
  role: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{
    id: string;
    email: string;
    role: string;
    token: string;
  }>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = getStoredAuth();
        console.log('Initializing auth with stored data:', stored);
        if (stored) {
          setUser({
            id: stored.email || 'unknown',
            email: stored.email,
            role: stored.role,
            token: stored.token
          });
          console.log('Auth initialized with user role:', stored.role);
        } else {
          console.log('No stored auth found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Listen for storage events to handle auth changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth') {
        initializeAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - in a real app, this would come from your API
      const mockUser = {
        id: '1',
        email,
        role: email.includes('admin') ? 'admin' : email.includes('vendor') ? 'vendor' : 'passenger',
        token: 'mock-jwt-token'
      };
      
      setUser(mockUser);
      // Store in localStorage
      localStorage.setItem('auth', JSON.stringify(mockUser));
      return mockUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
    // Use window.location to ensure full page reload and clear all state
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
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

export default AuthContext;
