"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Maaf, terjadi kesalahan saat memuat halaman. Coba lagi atau muat
            ulang halaman.
          </p>
          {this.state.error && (
            <details className="mb-6 max-w-lg w-full">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Detail error
              </summary>
              <pre className="mt-2 rounded-lg bg-muted p-3 text-xs text-destructive overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={this.handleRetry}>
              <RefreshCw className="size-4 mr-1" />
              Coba Lagi
            </Button>
            <Button onClick={this.handleReload}>Muat Ulang Halaman</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
