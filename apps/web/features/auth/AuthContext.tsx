"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type ReactElement
} from "react";
import type { User } from "@workspace/types";
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser
} from "./auth-token";
import { fetchCurrentUser, loginUser, registerUser } from "./api";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()));

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      return;
    }

    void fetchCurrentUser()
      .then((freshUser) => {
        if (freshUser) {
          setUser(freshUser);
        } else {
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const res = await loginUser({ email, password });
    setUser(res.user);
    setToken(res.token);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    const res = await registerUser({ name, email, password });
    setUser(res.user);
    setToken(res.token);
  }, []);

  const logout = useCallback((): void => {
    clearStoredAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
