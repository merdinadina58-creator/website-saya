"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface ContentData {
  hero?: Record<string, unknown>;
  about?: Record<string, unknown>;
  skills?: Record<string, unknown>;
  portfolio?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  footer?: Record<string, unknown>;
  apps?: unknown[];
  navbar?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ContentContextType {
  content: ContentData;
  loading: boolean;
  updateContent: (key: string, value: unknown) => Promise<void>;
  refreshContent: () => Promise<void>;
  syncStatus: "idle" | "syncing" | "synced" | "error" | "unavailable";
}

const ContentContext = createContext<ContentContextType | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

// localStorage key for content persistence (fallback on Vercel/serverless)
const LS_KEY = "website-content";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const username = localStorage.getItem("adminUsername");
  const password = localStorage.getItem("adminPassword");
  if (!username || !password) return {};
  return { "x-admin-username": username, "x-admin-password": password };
}

function loadFromLocalStorage(): ContentData {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Invalid JSON, ignore
  }
  return {};
}

/** Deep merge: for each top-level key, merge objects but let arrays be replaced entirely.
 *  Source values take priority over target values. */
function deepMergeContent(target: ContentData, source: ContentData): ContentData {
  const result: ContentData = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      // Both are non-array objects → merge them (source overrides target keys)
      result[key] = { ...targetVal, ...sourceVal };
    } else {
      // Arrays or primitives → source replaces target entirely
      result[key] = sourceVal;
    }
  }
  return result;
}

function saveToLocalStorage(content: ContentData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(content));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<ContentContextType["syncStatus"]>("idle");
  const cloudSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Push content to cloud (debounced)
  const pushToCloud = useCallback(async (data: ContentData) => {
    try {
      setSyncStatus("syncing");

      // Get current credentials from localStorage
      const username = localStorage.getItem("adminUsername") || "admin";
      const password = localStorage.getItem("adminPassword") || "admin123";

      // Get current logo from localStorage
      let logo: Record<string, unknown> | undefined;
      try {
        const logoData = localStorage.getItem("website-logo");
        if (logoData) logo = JSON.parse(logoData);
      } catch {}

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          content: data,
          credentials: { username, password },
          logo,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setSyncStatus("synced");
        } else {
          setSyncStatus(result.error === "Cloud sync tidak tersedia" ? "unavailable" : "error");
        }
      } else if (res.status === 401) {
        setSyncStatus("error");
      } else {
        setSyncStatus("unavailable");
      }
    } catch {
      setSyncStatus("unavailable");
    }
  }, []);

  // Debounced cloud push — wait 3 seconds after last change before pushing
  const scheduleCloudPush = useCallback((data: ContentData) => {
    if (cloudSyncTimerRef.current) {
      clearTimeout(cloudSyncTimerRef.current);
    }
    cloudSyncTimerRef.current = setTimeout(() => {
      pushToCloud(data);
    }, 3000);
  }, [pushToCloud]);

  const refreshContent = useCallback(async () => {
    try {
      // 1. Read from localStorage (immediate)
      const localData = loadFromLocalStorage();

      // 2. Fetch from database API
      let apiData: ContentData = {};
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          apiData = await res.json();
        }
      } catch {}

      // 3. Fetch from cloud (GitHub Gist)
      let cloudData: ContentData = {};
      let cloudCredentials: { username: string; password: string } | null = null;
      let cloudAvailable = false;
      try {
        const res = await fetch("/api/sync");
        if (res.ok) {
          const data = await res.json();
          if (data.available) {
            cloudAvailable = true;
            if (data.data) {
              cloudData = data.data.content || {};
              cloudCredentials = data.data.credentials || null;

              // Save cloud logo to localStorage if available
              if (data.data.logo?.src) {
                try {
                  localStorage.setItem("website-logo", JSON.stringify(data.data.logo));
                } catch {}
              }
            }
          }
        }
      } catch {}

      // 4. Merge: localStorage + API + cloud (cloud wins for conflicts)
      let merged = deepMergeContent(localData, apiData);
      if (Object.keys(cloudData).length > 0) {
        merged = deepMergeContent(merged, cloudData);
      }

      // 5. Save merged data
      setContent(merged);
      saveToLocalStorage(merged);

      // 6. Save cloud credentials to localStorage for AdminProvider
      if (cloudCredentials) {
        try {
          localStorage.setItem("cloudCredentials", JSON.stringify(cloudCredentials));
        } catch {}
      }

      // 7. Set sync status
      setSyncStatus(cloudAvailable ? "synced" : "unavailable");
    } catch {
      // Fallback to localStorage only
      const localData = loadFromLocalStorage();
      if (Object.keys(localData).length > 0) {
        setContent(localData);
      }
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const updateContent = useCallback(
    async (key: string, value: unknown) => {
      // Optimistically update local state and localStorage first
      // This ensures edits work even on Vercel where DB is read-only
      const updatedContent = { ...content, [key]: value };
      setContent(updatedContent);
      saveToLocalStorage(updatedContent);

      // Schedule cloud push (debounced)
      scheduleCloudPush(updatedContent);

      // Then try to persist to database (non-blocking — don't fail the edit if DB is down)
      try {
        const res = await fetch(`/api/content/${key}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ value }),
        });
        if (res.status === 401) {
          // Session expired — clear admin state
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminUsername");
          localStorage.removeItem("adminPassword");
          window.location.reload();
          throw new Error("Sesi admin berakhir. Silakan login kembali.");
        }
        // All other responses (including 503, 500, etc.) are OK —
        // content is already saved in localStorage
      } catch (e) {
        // Re-throw auth errors only
        if (e instanceof Error && e.message.includes("Sesi admin")) {
          throw e;
        }
        // Network errors / API errors — content is still saved in localStorage, that's fine
      }
    },
    [content, scheduleCloudPush]
  );

  return (
    <ContentContext.Provider
      value={{ content, loading, updateContent, refreshContent, syncStatus }}
    >
      {children}
    </ContentContext.Provider>
  );
}
