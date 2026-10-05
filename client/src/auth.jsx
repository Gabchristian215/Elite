import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!getToken()) return;
    api.me()
      .then(res => setUser(res.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const startSession = res => {
    setToken(res.token);
    setUser(res.data.user);
  };

  const login = async (username, password) => startSession(await api.login(username, password));
  const signup = async (username, email, password) =>
    startSession(await api.signup(username, email, password));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setSession: startSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
