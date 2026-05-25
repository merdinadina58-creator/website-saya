"use client";

import { Github, Linkedin, Twitter, ArrowUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const socialLinks = [
  { icon: <Github className="size-4" />, label: "GitHub", href: "#" },
  { icon: <Linkedin className="size-4" />, label: "LinkedIn", href: "#" },
  { icon: <Twitter className="size-4" />, label: "Twitter", href: "#" },
];

export default function FooterSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold tracking-tight text-foreground">
              Alex<span className="text-accent">.</span>Morgan
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Developer Kreatif & Desainer
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Back to Top */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="text-muted-foreground hover:text-accent cursor-pointer"
            aria-label="Kembali ke atas"
          >
            <ArrowUp className="size-4 mr-1" />
            Kembali ke Atas
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Alex Morgan. Semua hak dilindungi.
          </p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="size-3 text-accent fill-accent" /> dan
            banyak kopi
          </p>
        </div>
      </div>
    </footer>
  );
}
