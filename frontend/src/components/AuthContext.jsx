import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('datum_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem('datum_token', token);
        setUser({ 
          email: decoded.sub, 
          id: decoded.id, 
          is_guest: !!decoded.is_guest 
        });
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    } else {
      localStorage.removeItem('datum_token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    // user state will be updated by the useEffect above
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const guestLogin = async (email) => {
    try {
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        const data = await response.json();
        login(data.token);
        return true;
      }
    } catch (error) {
      console.error('Guest login failed:', error);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, guestLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
