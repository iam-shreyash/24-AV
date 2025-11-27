import { createContext, useContext, useState, ReactNode } from 'react';
import { getStoredAuth } from './Login';

type User = {
  id: string;
  email: string;
  role: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Populate initial user synchronously from local storage to avoid transient nulls
  const stored = getStoredAuth();
  const [user, setUser] = useState<User | null>(
    stored ? { id: stored.email || stored.role || 'unknown', email: stored.email, role: stored.role } : null
  );

  // We no longer block rendering of the app while auth is being checked.
  // Components can use the `loading` flag if they need to wait for auth verification.
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with your actual login API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // Mock response for now
      const mockUser = {
        id: '1',
        email,
        role: 'passenger' // or 'driver', 'admin', etc.
      };
      
      setUser(mockUser);
      // localStorage.setItem('token', data.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    // Redirect to login or home page
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
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
