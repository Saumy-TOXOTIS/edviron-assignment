import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, refresh as apiRefresh, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem('tokens');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (tokens?.accessToken) {
      setAuthToken(tokens.accessToken);
    } else {
      setAuthToken(null);
    }
  }, [tokens]);

  const saveAuth = (userData, tokenData) => {
    setUser(userData);
    setTokens(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokens', JSON.stringify(tokenData));
    setAuthToken(tokenData.accessToken);
  };

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    saveAuth(data.user, data.tokens);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    setAuthToken(null);
  };

  const refresh = async () => {
    if (!tokens?.refreshToken) return null;
    const { data } = await apiRefresh(tokens.refreshToken);
    const nextTokens = { ...tokens, ...data.tokens };
    saveAuth(user, nextTokens);
    return nextTokens;
  };

  const value = useMemo(
    () => ({ user, tokens, login, logout, refresh }),
    [user, tokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
