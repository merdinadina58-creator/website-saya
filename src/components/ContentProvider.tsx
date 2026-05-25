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

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const password = localStorage.getItem("adminPassword");
  if (!password) return {};
  return { "x-admin-password": password };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);

  const refreshContent = useCallback(async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (e) {
      console.error("Failed to load content:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const updateContent = useCallback(
    async (key: string, value: unknown) => {
      try {
        const res = await fetch(`/api/content/${key}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ value }),
        });
        if (res.ok) {
          setContent((prev) => ({ ...prev, [key]: value }));
        } else if (res.status === 401) {
          // Session expired — clear admin state
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminPassword");
          window.location.reload();
          throw new Error("Sesi admin berakhir. Silakan login kembali.");
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Gagal menyimpan konten");
        }
      } catch (e) {
        console.error("Failed to update content:", e);
        throw e;
      }
    },
    []
  );

  return (
    <ContentContext.Provider
      value={{ content, loading, updateContent, refreshContent }}
    >
      {children}
    </ContentContext.Provider>
  );
}
