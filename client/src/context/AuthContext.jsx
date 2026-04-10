import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { applyClientAuth, clearClientAuth } from '../lib/auth-session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    return res.data.user;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
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

  const signOut = () => {
    clearClientAuth({ api });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, handleGoogleToken, refreshUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
