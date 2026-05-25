"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

  const refreshContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        // Merge: API data takes priority, localStorage fills gaps
        const localData = loadFromLocalStorage();
        const merged = { ...localData, ...data };
        setContent(merged);
        saveToLocalStorage(merged);
      } else {
        // API failed (e.g., Vercel serverless DB unavailable)
        // Fall back to localStorage
        const localData = loadFromLocalStorage();
        if (Object.keys(localData).length > 0) {
          setContent(localData);
        }
      }
    } catch {
      // Network error — use localStorage fallback
      const localData = loadFromLocalStorage();
      if (Object.keys(localData).length > 0) {
        setContent(localData);
      }
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
    [content]
  );

  return (
    <ContentContext.Provider
      value={{ content, loading, updateContent, refreshContent }}
    >
      {children}
    </ContentContext.Provider>
  );
}
