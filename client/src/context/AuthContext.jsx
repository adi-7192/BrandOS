import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { applyClientAuth, clearClientAuth, getClientAuthToken } from '../lib/auth-session';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    return res.data.user;
  };

  useEffect(() => {
    const token = getClientAuthToken();
    if (token) {
      applyClientAuth({ api, token });
      refreshUser()
        .catch(() => {
          clearClientAuth({ api });
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (credentials) => {
    const res = await api.post('/auth/signin', credentials);
    const { token, user } = res.data;
    applyClientAuth({ api, token });
    setUser(user);
    return user;
  };

  const signUp = async (data) => {
    const res = await api.post('/auth/signup', data);
    const { token, user } = res.data;
    applyClientAuth({ api, token });
    setUser(user);
    return user;
  };

  const handleGoogleToken = async (token) => {
    applyClientAuth({ api, token });
    return refreshUser();
  };

  const updateProfile = async (data) => {
    const res = await api.patch('/auth/profile', data);
    setUser(res.data.user);
    return res.data.user;
  };

  const signOut = useCallback(() => {
    clearClientAuth({ api });
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    let timer = setTimeout(signOut, INACTIVITY_TIMEOUT_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(signOut, INACTIVITY_TIMEOUT_MS);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('click', reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('click', reset);
    };
  }, [user, signOut]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, handleGoogleToken, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
