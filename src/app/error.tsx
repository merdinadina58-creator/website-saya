"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="size-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Terjadi Kesalahan
      </h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Maaf, halaman ini mengalami kesalahan. Silakan coba lagi atau muat
        ulang halaman.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="size-4 mr-1" />
          Coba Lagi
        </Button>
        <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
      </div>
    </div>
  );
}
