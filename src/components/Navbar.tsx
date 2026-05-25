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
  Globe,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
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
import { useContent } from "@/components/ContentProvider";
import { useAdmin } from "@/components/AdminProvider";
import { defaultApps, type AppItem } from "@/data/apps";

const navLinks = [
  { label: "Tentang", href: "#about" },
  { label: "Keahlian", href: "#skills" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Kontak", href: "#contact" },
];

// ── useMounted hook ──
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  // Admin state
  const { isAdmin, login, logout } = useAdmin();
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const { content, updateContent } = useContent();
  const apps = (content.apps as AppItem[]) || defaultApps;

  // Navbar brand from content (fallback to footer data or default)
  const footer = content.footer as { brandName?: string; brandAccent?: string } | undefined;
  const brandName = footer?.brandName || "Alex";
  const brandAccent = footer?.brandAccent || "Morgan";

  const handleAddApp = useCallback(async () => {
    const name = newName.trim();
    let url = newUrl.trim();
    if (!name || !url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const newApps = [...apps, { name, url }];
    await updateContent("apps", newApps);
    setNewName("");
    setNewUrl("");
    setAddDialogOpen(false);
    setMobileAddOpen(false);
  }, [newName, newUrl, apps, updateContent]);

  const handleRemoveApp = useCallback(
    async (index: number) => {
      const updated = apps.filter((_, i) => i !== index);
      await updateContent("apps", updated);
    },
    [apps, updateContent]
  );

  // Login handler
  const handleLogin = useCallback(async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      const success = await login(loginPassword);
      if (success) {
        setLoginOpen(false);
        setLoginPassword("");
        setLoginError("");
      } else {
        setLoginError("Password salah. Coba lagi.");
      }
    } catch {
      setLoginError("Gagal login. Coba lagi.");
    } finally {
      setLoginLoading(false);
    }
  }, [login, loginPassword]);

  // Password change handler
  const handleChangePassword = useCallback(async () => {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("Password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("Password baru minimal 4 karakter.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": localStorage.getItem("adminPassword") || "",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (res.ok) {
        // Update stored password
        localStorage.setItem("adminPassword", newPassword);
        setPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      } else {
        const data = await res.json().catch(() => ({}));
        setPasswordError(data.error || "Gagal mengubah password.");
      }
    } catch {
      setPasswordError("Gagal mengubah password.");
    } finally {
      setPasswordLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword]);

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
          {brandName}
          <span className="text-accent">.</span>
          {brandAccent}
          {isAdmin && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              <ShieldCheck className="size-3" />
              Admin
            </span>
          )}
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
                    key={`${app.name}-${i}`}
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
                    {isAdmin && (
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
                    )}
                  </DropdownMenuItem>
                ))}
              </div>

              {/* Add App — only for admin */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
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
                </>
              )}
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

          {/* Admin Login/Logout */}
          {mounted && (
            <>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-accent hover:text-accent hover:bg-accent/10"
                      aria-label="Menu admin"
                    >
                      <ShieldCheck className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Mode Admin
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setPasswordDialogOpen(true)}
                      className="cursor-pointer"
                    >
                      <KeyRound className="size-4 mr-2" />
                      Ubah Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="size-4 mr-2" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLoginOpen(true)}
                  aria-label="Login admin"
                  className="hover:text-accent"
                >
                  <Lock className="size-4" />
                </Button>
              )}
            </>
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
                    {brandName}
                    <span className="text-accent">.</span>
                    {brandAccent}
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

                  {/* Mobile Admin Login/Logout */}
                  <div className="pt-2 border-b border-border pb-4">
                    {isAdmin ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-accent">
                          <ShieldCheck className="size-4" />
                          Mode Admin Aktif
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPasswordDialogOpen(true)}
                          className="w-full text-xs"
                        >
                          <KeyRound className="size-3.5 mr-1" />
                          Ubah Password
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={logout}
                          className="w-full text-xs text-destructive hover:text-destructive"
                        >
                          <LogOut className="size-3.5 mr-1" />
                          Keluar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLoginOpen(true)}
                        className="w-full text-xs"
                      >
                        <Lock className="size-3.5 mr-1" />
                        Login Admin
                      </Button>
                    )}
                  </div>

                  {/* Mobile Apps Section */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                        Aplikasi Saya
                      </p>
                      {isAdmin && (
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
                      )}
                    </div>

                    <div className="space-y-2">
                      {apps.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Belum ada aplikasi
                        </p>
                      )}
                      {apps.map((app, i) => (
                        <div
                          key={`${app.name}-${i}`}
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
                          {isAdmin && (
                            <button
                              onClick={() => handleRemoveApp(i)}
                              className="shrink-0 opacity-0 group-hover/item:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                              aria-label={`Hapus ${app.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
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

      {/* Login Dialog */}
      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="size-5 text-accent" />
              Login Admin
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Masukkan password admin untuk mengakses fitur edit website.
            </p>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Masukkan password"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
              />
            </div>
            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleLogin}
              disabled={!loginPassword.trim() || loginLoading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-accent" />
              Ubah Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                Password Lama
              </label>
              <Input
                id="current-password"
                type="password"
                placeholder="Masukkan password lama"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordError("");
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                Password Baru
              </label>
              <Input
                id="new-password"
                type="password"
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">
                Konfirmasi Password Baru
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChangePassword();
                }}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleChangePassword}
              disabled={
                !currentPassword.trim() ||
                !newPassword.trim() ||
                !confirmPassword.trim() ||
                passwordLoading
              }
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {passwordLoading ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
}
