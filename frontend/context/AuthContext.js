"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vedic-astro-backend-rox2.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email, name }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (saved && savedUser) {
      setToken(saved);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function signup(email, name, password) {
    const res = await fetch(`${BACKEND}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Signup failed");
    _persist(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const res = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    _persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }

  function _persist(tok, usr) {
    localStorage.setItem("auth_token", tok);
    localStorage.setItem("auth_user", JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
