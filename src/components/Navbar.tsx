"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  ExternalLink,
  Trash2,
  GripVertical,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { defaultApps, type AppItem } from "@/data/apps";

const navLinks = [
  { label: "Tentang", href: "#about" },
  { label: "Keahlian", href: "#skills" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Kontak", href: "#contact" },
];

const STORAGE_KEY = "my-apps-list";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function loadApps(): AppItem[] {
  if (typeof window === "undefined") return defaultApps;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return defaultApps;
}

function saveApps(apps: AppItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsLoaded, setAppsLoaded] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  // Load apps from localStorage after hydration
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (isClient && !appsLoaded) {
    setApps(loadApps());
    setAppsLoaded(true);
  }

  const handleAddApp = useCallback(() => {
    const name = newName.trim();
    let url = newUrl.trim();
    if (!name || !url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const updated = [...apps, { name, url }];
    setApps(updated);
    saveApps(updated);
    setNewName("");
    setNewUrl("");
    setAddDialogOpen(false);
    setMobileAddOpen(false);
  }, [newName, newUrl, apps]);

  const handleRemoveApp = useCallback(
    (index: number) => {
      const updated = apps.filter((_, i) => i !== index);
      setApps(updated);
      saveApps(updated);
    },
    [apps]
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-lg font-bold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          Alex<span className="text-accent">.</span>Morgan
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
            </a>
          ))}

          {/* Desktop Apps Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors relative group flex items-center gap-1">
                <Globe className="size-3.5" />
                Aplikasi
                <ChevronDown className="size-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                Aplikasi Saya
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* App List */}
              <div className="max-h-72 overflow-y-auto py-1">
                {apps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada aplikasi
                  </p>
                )}
                {apps.map((app, i) => (
                  <DropdownMenuItem
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer group/item focus:bg-accent/10"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                        <Globe className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {app.url}
                        </p>
                      </div>
                      <ExternalLink className="size-3.5 text-muted-foreground/40 shrink-0" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveApp(i);
                      }}
                      className="shrink-0 opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                      aria-label={`Hapus ${app.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </div>

              <DropdownMenuSeparator />

              {/* Add App Dialog */}
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-accent hover:bg-accent/10 transition-colors">
                    <Plus className="size-4" />
                    Tambah Aplikasi
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tambah Aplikasi Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="desktop-app-name" className="text-sm font-medium">
                        Nama Aplikasi
                      </label>
                      <Input
                        id="desktop-app-name"
                        placeholder="Contoh: Dashboard"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="desktop-app-url" className="text-sm font-medium">
                        URL Aplikasi
                      </label>
                      <Input
                        id="desktop-app-url"
                        placeholder="Contoh: https://dashboard.saya.com"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Batal</Button>
                    </DialogClose>
                    <Button
                      onClick={handleAddApp}
                      disabled={!newName.trim() || !newUrl.trim()}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      <Plus className="size-4 mr-1" />
                      Tambah
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Ganti tema"
              className="hover:text-accent"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Buka menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    Alex<span className="text-accent">.</span>Morgan
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 px-4 mt-4">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="text-base font-medium text-muted-foreground hover:text-accent transition-colors py-2 border-b border-border"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}

                  {/* Mobile Apps Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                        Aplikasi Saya
                      </p>
                      <Dialog open={mobileAddOpen} onOpenChange={setMobileAddOpen}>
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                            <Plus className="size-3" />
                            Tambah
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Tambah Aplikasi Baru</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="mobile-app-name" className="text-sm font-medium">
                                Nama Aplikasi
                              </label>
                              <Input
                                id="mobile-app-name"
                                placeholder="Contoh: Dashboard"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="mobile-app-url" className="text-sm font-medium">
                                URL Aplikasi
                              </label>
                              <Input
                                id="mobile-app-url"
                                placeholder="Contoh: https://dashboard.saya.com"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Batal</Button>
                            </DialogClose>
                            <Button
                              onClick={handleAddApp}
                              disabled={!newName.trim() || !newUrl.trim()}
                              className="bg-accent text-accent-foreground hover:bg-accent/90"
                            >
                              <Plus className="size-4 mr-1" />
                              Tambah
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="space-y-2">
                      {apps.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Belum ada aplikasi
                        </p>
                      )}
                      {apps.map((app, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 group/item"
                        >
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 flex-1 min-w-0"
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                              <Globe className="size-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground truncate">
                                {app.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {app.url}
                              </p>
                            </div>
                            <ExternalLink className="size-3.5 text-muted-foreground/40 shrink-0" />
                          </a>
                          <button
                            onClick={() => handleRemoveApp(i)}
                            className="shrink-0 opacity-0 group-hover/item:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                            aria-label={`Hapus ${app.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
