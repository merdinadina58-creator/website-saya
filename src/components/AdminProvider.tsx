"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

// ── Custom event for admin state changes ──
const ADMIN_CHANGE_EVENT = "admin-state-change";

function subscribeToAdmin(callback: () => void) {
  window.addEventListener(ADMIN_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ADMIN_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getAdminSnapshot(): boolean {
  return localStorage.getItem("isAdmin") === "true";
}

function getAdminServerSnapshot(): boolean {
  return false;
}

function notifyAdminChange() {
  window.dispatchEvent(new Event(ADMIN_CHANGE_EVENT));
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // Hydration-safe admin state using useSyncExternalStore
  const isAdmin = useSyncExternalStore(
    subscribeToAdmin,
    getAdminSnapshot,
    getAdminServerSnapshot
  );

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminPassword", password);
        notifyAdminChange();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminPassword");
    notifyAdminChange();
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const password = localStorage.getItem("adminPassword");
    if (!password) return {};
    return { "x-admin-password": password };
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdmin, login, logout, getAuthHeaders }}
    >
      {children}
    </AdminContext.Provider>
  );
}
