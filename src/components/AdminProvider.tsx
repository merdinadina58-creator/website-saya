"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface AdminContextType {
  isAdmin: boolean;
  adminUsername: string;
  login: (username: string, password: string) => Promise<boolean>;
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

function getAdminUsernameSnapshot(): string {
  return localStorage.getItem("adminUsername") || "";
}

function getAdminUsernameServerSnapshot(): string {
  return "";
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

  const adminUsername = useSyncExternalStore(
    subscribeToAdmin,
    getAdminUsernameSnapshot,
    getAdminUsernameServerSnapshot
  );

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem("adminUsername", username);
          localStorage.setItem("adminPassword", password);
          notifyAdminChange();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminPassword");
    notifyAdminChange();
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const username = localStorage.getItem("adminUsername");
    const password = localStorage.getItem("adminPassword");
    if (!username || !password) return {};
    return { "x-admin-username": username, "x-admin-password": password };
  }, []);

  return (
    <AdminContext.Provider
      value={{ isAdmin, adminUsername, login, logout, getAuthHeaders }}
    >
      {children}
    </AdminContext.Provider>
  );
}
