"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
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

// ── localStorage keys ──
const LS_ADMIN_KEY = "isAdmin";
const LS_USERNAME_KEY = "adminUsername";
const LS_PASSWORD_KEY = "adminPassword";
const LS_CLOUD_CREDS_KEY = "cloudCredentials";

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
  return localStorage.getItem(LS_ADMIN_KEY) === "true";
}

function getAdminServerSnapshot(): boolean {
  return false;
}

function getAdminUsernameSnapshot(): string {
  return localStorage.getItem(LS_USERNAME_KEY) || "";
}

function getAdminUsernameServerSnapshot(): string {
  return "";
}

function notifyAdminChange() {
  window.dispatchEvent(new Event(ADMIN_CHANGE_EVENT));
}

/** Read cloud-synced credentials from localStorage (updated by ContentProvider) */
function getCloudCredentials(): { username: string; password: string } | null {
  try {
    const stored = localStorage.getItem(LS_CLOUD_CREDS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Invalid JSON
  }
  return null;
}

/** Save cloud-synced credentials to localStorage */
function saveCloudCredentials(credentials: { username: string; password: string }) {
  try {
    localStorage.setItem(LS_CLOUD_CREDS_KEY, JSON.stringify(credentials));
  } catch {
    // localStorage full
  }
}

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

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

  // Fetch cloud credentials on mount and store them locally
  useEffect(() => {
    async function fetchCloudCreds() {
      try {
        const res = await fetch("/api/sync");
        if (res.ok) {
          const data = await res.json();
          if (data.available && data.data?.credentials) {
            saveCloudCredentials(data.data.credentials);
            // If user is already logged in, update their stored credentials
            const currentUsername = localStorage.getItem(LS_USERNAME_KEY);
            if (currentUsername === data.data.credentials.username) {
              localStorage.setItem(LS_PASSWORD_KEY, data.data.credentials.password);
              notifyAdminChange();
            }
          }
        }
      } catch {
        // Cloud not available
      }
    }
    fetchCloudCreds();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      let hasCustomCredentials = false;

      // 1. Check cloud-synced credentials from localStorage first
      // These are synced from GitHub and persist across devices
      const cloudCreds = getCloudCredentials();
      if (cloudCreds) {
        hasCustomCredentials = true;
        if (username === cloudCreds.username && password === cloudCreds.password) {
          localStorage.setItem(LS_ADMIN_KEY, "true");
          localStorage.setItem(LS_USERNAME_KEY, username);
          localStorage.setItem(LS_PASSWORD_KEY, password);
          notifyAdminChange();
          return true;
        }
      }

      // 2. Check previously stored session credentials
      // (these are from a previous successful login on this device)
      const storedUsername = localStorage.getItem(LS_USERNAME_KEY);
      const storedPassword = localStorage.getItem(LS_PASSWORD_KEY);
      if (storedUsername && storedPassword) {
        // If stored credentials differ from defaults, custom credentials exist
        if (storedUsername !== DEFAULT_USERNAME || storedPassword !== DEFAULT_PASSWORD) {
          hasCustomCredentials = true;
        }
        if (username === storedUsername && password === storedPassword) {
          localStorage.setItem(LS_ADMIN_KEY, "true");
          localStorage.setItem(LS_USERNAME_KEY, username);
          localStorage.setItem(LS_PASSWORD_KEY, password);
          notifyAdminChange();
          return true;
        }
      }

      // 3. Default credentials — ONLY if no custom credentials have been set
      // Once the user changes their password, admin/admin123 no longer works
      if (!hasCustomCredentials && username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        localStorage.setItem(LS_ADMIN_KEY, "true");
        localStorage.setItem(LS_USERNAME_KEY, username);
        localStorage.setItem(LS_PASSWORD_KEY, password);
        notifyAdminChange();
        return true;
      }

      // 4. Try API (server-side verification with same cascade logic)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (res.ok) {
          localStorage.setItem(LS_ADMIN_KEY, "true");
          localStorage.setItem(LS_USERNAME_KEY, username);
          localStorage.setItem(LS_PASSWORD_KEY, password);
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
    localStorage.removeItem(LS_ADMIN_KEY);
    localStorage.removeItem(LS_USERNAME_KEY);
    localStorage.removeItem(LS_PASSWORD_KEY);
    notifyAdminChange();
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (typeof window === "undefined") return {};
    const username = localStorage.getItem(LS_USERNAME_KEY);
    const password = localStorage.getItem(LS_PASSWORD_KEY);
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
