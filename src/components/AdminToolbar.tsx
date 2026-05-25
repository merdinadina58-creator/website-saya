"use client";

import { useAdmin } from "@/components/AdminProvider";
import { ShieldCheck, Pencil, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminToolbar() {
  const { isAdmin, adminUsername, logout } = useAdmin();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-2 shadow-lg shadow-accent/20">
      <ShieldCheck className="size-4 text-accent-foreground" />
      <span className="text-xs font-semibold text-accent-foreground">
        Mode Edit Aktif
      </span>
      <span className="text-[10px] text-accent-foreground/70">
        ({adminUsername || "admin"})
      </span>
      <div className="w-px h-4 bg-accent-foreground/30 mx-1" />
      <Pencil className="size-3 text-accent-foreground" />
      <span className="text-[10px] text-accent-foreground/80">
        Klik ✏️ di setiap seksi
      </span>
      <div className="w-px h-4 bg-accent-foreground/30 mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="h-6 px-2 text-[10px] text-accent-foreground hover:bg-accent-foreground/20 hover:text-accent-foreground"
      >
        <LogOut className="size-3 mr-1" />
        Keluar
      </Button>
    </div>
  );
}
