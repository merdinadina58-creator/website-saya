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
  UserCog,
  LogOut,
  User,
  Eye,
  EyeOff,
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
import { Separator } from "@/components/ui/separator";
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

// ── Password Input with show/hide toggle ──
function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  onKeyDown,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? "Sembunyikan password" : "Lihat password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
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
  const { isAdmin, adminUsername, login, logout } = useAdmin();

  // Login dialog
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Account settings dialog
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountCurrentUsername, setAccountCurrentUsername] = useState("");
  const [accountCurrentPassword, setAccountCurrentPassword] = useState("");
  const [accountNewUsername, setAccountNewUsername] = useState("");
  const [accountNewPassword, setAccountNewPassword] = useState("");
  const [accountConfirmPassword, setAccountConfirmPassword] = useState("");
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  const { content, updateContent } = useContent();
  const apps = (content.apps as AppItem[]) || defaultApps;

  // Navbar brand from content
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
      const success = await login(loginUsername.trim(), loginPassword);
      if (success) {
        setLoginOpen(false);
        setLoginUsername("");
        setLoginPassword("");
        setLoginError("");
      } else {
        setLoginError("Username atau password salah. Coba lagi.");
      }
    } catch {
      setLoginError("Gagal login. Coba lagi.");
    } finally {
      setLoginLoading(false);
    }
  }, [login, loginUsername, loginPassword]);

  // Account settings handler
  const handleAccountSave = useCallback(async () => {
    setAccountError("");
    setAccountSuccess("");

    if (!accountCurrentUsername.trim() || !accountCurrentPassword) {
      setAccountError("Username dan password lama wajib diisi.");
      return;
    }

    if (accountNewPassword && accountNewPassword !== accountConfirmPassword) {
      setAccountError("Password baru tidak cocok.");
      return;
    }

    if (accountNewPassword && accountNewPassword.length < 4) {
      setAccountError("Password baru minimal 4 karakter.");
      return;
    }

    if (accountNewUsername.trim() && accountNewUsername.trim().length < 2) {
      setAccountError("Username baru minimal 2 karakter.");
      return;
    }

    setAccountLoading(true);
    try {
      const res = await fetch("/api/auth/account", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-username": localStorage.getItem("adminUsername") || "",
          "x-admin-password": localStorage.getItem("adminPassword") || "",
        },
        body: JSON.stringify({
          currentUsername: accountCurrentUsername.trim(),
          currentPassword: accountCurrentPassword,
          newUsername: accountNewUsername.trim() || undefined,
          newPassword: accountNewPassword || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Update stored credentials
        const updatedUsername = data.username || accountCurrentUsername.trim();
        const updatedPassword = accountNewPassword || accountCurrentPassword;
        localStorage.setItem("adminUsername", updatedUsername);
        localStorage.setItem("adminPassword", updatedPassword);
        // Trigger state sync
        window.dispatchEvent(new Event("admin-state-change"));

        setAccountSuccess("Akun berhasil diperbarui!");
        setAccountCurrentPassword("");
        setAccountNewUsername("");
        setAccountNewPassword("");
        setAccountConfirmPassword("");

        // Close dialog after short delay to show success
        setTimeout(() => {
          setAccountOpen(false);
          setAccountSuccess("");
          setAccountError("");
        }, 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        setAccountError(data.error || "Gagal memperbarui akun.");
      }
    } catch {
      setAccountError("Gagal memperbarui akun.");
    } finally {
      setAccountLoading(false);
    }
  }, [
    accountCurrentUsername,
    accountCurrentPassword,
    accountNewUsername,
    accountNewPassword,
    accountConfirmPassword,
  ]);

  // Open account settings — pre-fill current username
  const handleAccountOpen = useCallback(() => {
    setAccountCurrentUsername(adminUsername || "");
    setAccountCurrentPassword("");
    setAccountNewUsername("");
    setAccountNewPassword("");
    setAccountConfirmPassword("");
    setAccountError("");
    setAccountSuccess("");
    setAccountOpen(true);
  }, [adminUsername]);

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
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-accent" />
                        <span className="text-foreground font-semibold">
                          {adminUsername || "admin"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Mode Admin Aktif
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleAccountOpen}
                      className="cursor-pointer"
                    >
                      <UserCog className="size-4 mr-2" />
                      Pengaturan Akun
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
                          <User className="size-3.5" />
                          {adminUsername || "admin"}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAccountOpen}
                          className="w-full text-xs"
                        >
                          <UserCog className="size-3.5 mr-1" />
                          Pengaturan Akun
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

      {/* ─── Login Dialog ─── */}
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
              Masukkan username dan password untuk mengakses fitur edit website.
            </p>
            <div className="space-y-2">
              <label htmlFor="admin-username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Masukkan username"
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setLoginError("");
                }}
                autoComplete="username"
              />
            </div>
            <PasswordInput
              id="admin-password"
              label="Password"
              placeholder="Masukkan password"
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                setLoginError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              autoComplete="current-password"
            />
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
              disabled={!loginUsername.trim() || !loginPassword.trim() || loginLoading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loginLoading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Account Settings Dialog ─── */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-accent" />
              Pengaturan Akun
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Current credentials */}
            <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/30">
              <p className="text-sm font-semibold text-foreground">
                Verifikasi Identitas
              </p>
              <p className="text-xs text-muted-foreground">
                Masukkan username dan password lama untuk mengkonfirmasi perubahan.
              </p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="acct-current-username" className="text-sm font-medium">
                    Username Lama
                  </label>
                  <Input
                    id="acct-current-username"
                    type="text"
                    placeholder="Username saat ini"
                    value={accountCurrentUsername}
                    onChange={(e) => {
                      setAccountCurrentUsername(e.target.value);
                      setAccountError("");
                      setAccountSuccess("");
                    }}
                    autoComplete="username"
                  />
                </div>
                <PasswordInput
                  id="acct-current-password"
                  label="Password Lama"
                  placeholder="Password saat ini"
                  value={accountCurrentPassword}
                  onChange={(e) => {
                    setAccountCurrentPassword(e.target.value);
                    setAccountError("");
                    setAccountSuccess("");
                  }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Separator />

            {/* New credentials */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-foreground">
                Perubahan Baru
              </p>
              <p className="text-xs text-muted-foreground">
                Isi field yang ingin Anda ubah. Kosongkan jika tidak ingin mengubah.
              </p>

              <div className="space-y-2">
                <label htmlFor="acct-new-username" className="text-sm font-medium">
                  Username Baru
                </label>
                <Input
                  id="acct-new-username"
                  type="text"
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={accountNewUsername}
                  onChange={(e) => {
                    setAccountNewUsername(e.target.value);
                    setAccountError("");
                    setAccountSuccess("");
                  }}
                  autoComplete="off"
                />
              </div>

              <PasswordInput
                id="acct-new-password"
                label="Password Baru"
                placeholder="Kosongkan jika tidak ingin mengubah"
                value={accountNewPassword}
                onChange={(e) => {
                  setAccountNewPassword(e.target.value);
                  setAccountError("");
                  setAccountSuccess("");
                }}
                autoComplete="new-password"
              />

              {accountNewPassword && (
                <PasswordInput
                  id="acct-confirm-password"
                  label="Konfirmasi Password Baru"
                  placeholder="Ulangi password baru"
                  value={accountConfirmPassword}
                  onChange={(e) => {
                    setAccountConfirmPassword(e.target.value);
                    setAccountError("");
                    setAccountSuccess("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAccountSave();
                  }}
                  autoComplete="new-password"
                />
              )}
            </div>

            {accountError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <p className="text-sm text-destructive">{accountError}</p>
              </div>
            )}
            {accountSuccess && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3">
                <p className="text-sm text-green-600 dark:text-green-400">{accountSuccess}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleAccountSave}
              disabled={
                !accountCurrentUsername.trim() ||
                !accountCurrentPassword ||
                accountLoading
              }
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {accountLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.header>
  );
}
