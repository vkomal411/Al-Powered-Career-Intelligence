import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, UserResponse, logoutUser, clearStoredSession } from "../lib/api";

interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>;
  refreshUser: () => Promise<UserResponse | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  refreshUser: async () => null,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async (): Promise<UserResponse | null> => {
    try {
      const userData = await apiFetch<UserResponse>("/auth/me");
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      clearStoredSession();
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshUser,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
