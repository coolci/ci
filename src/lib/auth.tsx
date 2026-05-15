import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, setAccessToken, getAccessToken } from "./api/client";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user";
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<{ user: AuthUser }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => setAccessToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const r = await api.post<LoginResponse>("/auth/login", { username, password });
    setAccessToken(r.access_token);
    setUser(r.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const r = await api.post<LoginResponse>("/auth/register", { username, email, password });
    setAccessToken(r.access_token);
    setUser(r.user);
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  const refresh = async () => {
    const r = await api.get<{ user: AuthUser }>("/auth/me");
    setUser(r.user);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
