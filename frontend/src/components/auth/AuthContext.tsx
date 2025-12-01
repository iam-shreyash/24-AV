import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

type UserRole = 'admin' | 'vendor' | 'passenger' | null;

type AuthState = {
  isAuthenticated: boolean;
  userRole: UserRole;
  token: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<AuthState>;
  logout: () => void;
  loading: boolean;
  setAuth: (auth: AuthState) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    token: null,
  });
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.token) {
          setAuthState(parsed);
        }
      } catch (e) {
        console.error('Failed to parse auth from localStorage', e);
      }
    }
    setLoading(false);
  }, []);

  const setAuth = useCallback((newAuth: Partial<AuthState>) => {
    setAuthState(prev => {
      const updated = { ...prev, ...newAuth };
      localStorage.setItem('auth', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const login = async (email: string, password: string): Promise<AuthState> => {
    try {
      // Make real API call to backend with form data format
      const body = new URLSearchParams({
        username: email,
        password
      });
      
      const response = await axios.post('/api/auth/login', body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      const authData = {
        isAuthenticated: true,
        userRole: response.data.role,
        token: response.data.access_token,
      };

      setAuth(authData);
      return authData;

    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      token: null,
    });
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        loading,
        setAuth,
      }}
    >
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

export default AuthContext;