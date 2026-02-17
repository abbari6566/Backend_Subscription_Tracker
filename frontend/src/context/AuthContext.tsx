"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = { _id: string; name: string; email: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  setUser: (u: User) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t) setToken(t);
    if (u) try { setUser(JSON.parse(u)); } catch {}
    setMounted(true);
  }, []);

  const handleSetToken = (t: string | null) => {
    setToken(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  const handleSetUser = (u: User) => {
    setUser(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setUser: handleSetUser,
        setToken: handleSetToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
