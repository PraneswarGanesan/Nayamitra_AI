import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nyayamitra_token');
    const savedUser = localStorage.getItem('nyayamitra_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('nyayamitra_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    const accessToken = data.access_token;
    let userInfo = { email: username, role: 'law_officer' };
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      userInfo = {
        email: payload.sub || username,
        role: payload.role || 'law_officer',
        tenant_id: payload.tenant_id || 'default',
      };
    } catch {
      // fallback
    }
    localStorage.setItem('nyayamitra_token', accessToken);
    localStorage.setItem('nyayamitra_user', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
    return userInfo;
  };

  const signup = async (email, password, role, tenantId) => {
    const data = await authService.signup(email, password, role, tenantId);
    const accessToken = data.access_token;
    let userInfo = { email, role, tenant_id: tenantId };
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      userInfo = {
        email: payload.sub || email,
        role: payload.role || role,
        tenant_id: payload.tenant_id || tenantId,
      };
    } catch {
      // fallback
    }
    localStorage.setItem('nyayamitra_token', accessToken);
    localStorage.setItem('nyayamitra_user', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('nyayamitra_token');
    localStorage.removeItem('nyayamitra_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
