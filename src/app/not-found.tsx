"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <div className="flex size-20 items-center justify-center rounded-full bg-accent/10 mb-6">
        <AlertTriangle className="size-10 text-accent" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Maaf, halaman yang Anda cari tidak ditemukan.
      </p>
      <Button onClick={() => (window.location.href = "/")}>
        Kembali ke Beranda
      </Button>
    </div>
  );
}
