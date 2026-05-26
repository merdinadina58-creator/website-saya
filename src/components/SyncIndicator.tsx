"use client";

import { useContent } from "@/components/ContentProvider";
import { useAdmin } from "@/components/AdminProvider";
import { Cloud, CloudOff, Loader2, RefreshCw, Check } from "lucide-react";
import { useState } from "react";

export default function SyncIndicator() {
  const { syncStatus, refreshContent } = useContent();
  const { isAdmin } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);

  // Only show to admin users
  if (!isAdmin) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshContent();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={handleRefresh}
        className={`
          flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
          transition-all duration-200 shadow-md backdrop-blur-sm
          ${syncStatus === "synced"
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            : syncStatus === "syncing"
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              : syncStatus === "unavailable"
                ? "bg-muted/80 text-muted-foreground border border-border"
                : "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
          }
        `}
        aria-label="Status sinkronisasi"
      >
        {syncStatus === "synced" && <Check className="size-3" />}
        {syncStatus === "syncing" && <Loader2 className="size-3 animate-spin" />}
        {syncStatus === "unavailable" && <CloudOff className="size-3" />}
        {syncStatus === "error" && <Cloud className="size-3" />}
        {syncStatus === "idle" && <Cloud className="size-3" />}
        {refreshing ? (
          <RefreshCw className="size-3 animate-spin" />
        ) : (
          <span>
            {syncStatus === "synced" && "Tersinkronisasi"}
            {syncStatus === "syncing" && "Menyinkronkan..."}
            {syncStatus === "unavailable" && "Lokal saja"}
            {syncStatus === "error" && "Gagal sinkron"}
            {syncStatus === "idle" && "Memuat..."}
          </span>
        )}
      </button>
    </div>
  );
}
