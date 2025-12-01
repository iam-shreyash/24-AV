type StoredAuth = {
  isAuthenticated: boolean;
  userRole: 'admin' | 'vendor' | 'passenger' | null;
  token: string | null;
};

export const getStoredAuth = (): StoredAuth => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      userRole: null,
      token: null,
    };
  }

  try {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      return {
        isAuthenticated: false,
        userRole: null,
        token: null,
      };
    }

    const parsed = JSON.parse(stored);
    return {
      isAuthenticated: !!parsed.token,
      userRole: parsed.userRole || null,
      token: parsed.token || null,
    };
  } catch (error) {
    console.error('Error parsing auth data from localStorage:', error);
    return {
      isAuthenticated: false,
      userRole: null,
      token: null,
    };
  }
};

export const clearStoredAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
};

export const setStoredAuth = (auth: Omit<StoredAuth, 'isAuthenticated'>): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'auth',
      JSON.stringify({
        token: auth.token,
        userRole: auth.userRole,
      })
    );
  }
};
