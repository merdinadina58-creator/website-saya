"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Menu,
  Sun,
  Moon,
  LayoutDashboard,
  BarChart3,
  Mail,
  Cloud,
  MessageCircle,
  Kanban,
  ChevronDown,
  ExternalLink,
  Grid3X3,
  BookOpen,
  PenTool,
  Github,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { apps, type AppItem } from "@/data/apps";

const navLinks = [
  { label: "Tentang", href: "#about" },
  { label: "Keahlian", href: "#skills" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Kontak", href: "#contact" },
];

// Peta ikon Lucide berdasarkan nama string di konfigurasi
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  BarChart3,
  Mail,
  Cloud,
  MessageCircle,
  Kanban,
  BookOpen,
  PenTool,
  Github,
  Hash,
};

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function AppIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) return <Grid3X3 className={className} />;
  return <IconComponent className={className} />;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

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
                <Grid3X3 className="size-3.5" />
                Aplikasi
                <ChevronDown className="size-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
                Aplikasi Saya
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid grid-cols-2 gap-1 py-1">
                {apps.map((app: AppItem) => (
                  <DropdownMenuItem
                    key={app.name}
                    asChild
                    className="flex flex-col items-start gap-1 p-3 rounded-lg cursor-pointer focus:bg-accent/10"
                  >
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-start gap-1.5 w-full"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className={`shrink-0 ${app.color}`}>
                          <AppIcon iconName={app.icon} className="size-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground truncate">
                          {app.name}
                        </span>
                        <ExternalLink className="size-2.5 text-muted-foreground/50 ml-auto shrink-0" />
                      </div>
                      <span className="text-[11px] leading-tight text-muted-foreground line-clamp-1 pl-6">
                        {app.description}
                      </span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </div>
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
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 px-1">
                      Aplikasi Saya
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {apps.map((app: AppItem) => (
                        <SheetClose asChild key={app.name}>
                          <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-start gap-1.5 p-3 rounded-lg border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
                          >
                            <div className="flex items-center gap-2">
                              <div className={app.color}>
                                <AppIcon iconName={app.icon} className="size-4" />
                              </div>
                              <span className="text-sm font-medium text-foreground truncate">
                                {app.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 pl-6">
                              {app.description}
                            </span>
                          </a>
                        </SheetClose>
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
