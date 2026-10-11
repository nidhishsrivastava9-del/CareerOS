import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginApi, 
  registerApi, 
  getMeApi, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken,
  AUTH_UNAUTHORIZED_EVENT
} from '../utils/api';
import { saveUser as setStorageUser, getUser as getStorageUser } from '../utils/storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAuthToken());
  const [loading, setLoading] = useState(true);

  // Clear any cached business data to prevent cross-account leakage
  const purgeCachedUserData = () => {
    try {
      localStorage.removeItem('careeros_user');
      localStorage.removeItem('careeros_skills');
      localStorage.removeItem('careeros_projects');
      localStorage.removeItem('careeros_goals');
      localStorage.removeItem('careeros_dsa');
    } catch (err) {
      console.warn('[CareerOS Auth] Failed to clear user cache:', err);
    }
  };

  // Listen for unauthorized 401 events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      removeAuthToken();
      setToken(null);
      setUser(null);
      purgeCachedUserData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      return () => {
        window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
      };
    }
  }, []);

  // Initialize auth state by verifying existing token
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getMeApi();
        if (isMounted) {
          if (response && response.success && response.data) {
            setUser(response.data);
            setToken(storedToken);
            // Sync with storage user profile for UI consistency
            const currentStored = getStorageUser();
            setStorageUser({
              ...currentStored,
              name: response.data.name,
              email: response.data.email,
              id: response.data._id || response.data.id
            });
          } else {
            // Token is invalid or expired
            removeAuthToken();
            purgeCachedUserData();
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('[CareerOS Auth] Failed to verify existing session:', err);
        if (isMounted) {
          removeAuthToken();
          purgeCachedUserData();
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email, password) => {
    try {
      const response = await loginApi({ email, password });

      if (response && response.success && response.token) {
        purgeCachedUserData();
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);

        // Sync with local storage user
        const currentStored = getStorageUser();
        setStorageUser({
          ...currentStored,
          name: response.user.name,
          email: response.user.email,
          id: response.user.id
        });

        return { success: true, user: response.user };
      }

      return {
        success: false,
        message: response?.message || 'Login failed. Please check your credentials.'
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'An unexpected error occurred during login.'
      };
    }
  };

  /**
   * Register with name, email and password
   */
  const register = async (name, email, password) => {
    try {
      const response = await registerApi({ name, email, password });

      if (response && response.success && response.token) {
        purgeCachedUserData();
        setAuthToken(response.token);
        setToken(response.token);
        setUser(response.user);

        // Sync with local storage user
        const currentStored = getStorageUser();
        setStorageUser({
          ...currentStored,
          name: response.user.name,
          email: response.user.email,
          id: response.user.id
        });

        return { success: true, user: response.user };
      }

      return {
        success: false,
        message: response?.message || 'Registration failed. Please check the provided information.'
      };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'An unexpected error occurred during registration.'
      };
    }
  };

  /**
   * Logout authenticated user
   */
  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
    purgeCachedUserData();
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
