"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useContent } from "@/components/ContentProvider";
import { useAdmin } from "@/components/AdminProvider";

const defaultHero = {
  name: "Alex Morgan",
  title: "Developer Kreatif & Desainer",
  tagline:
    "Menciptakan pengalaman digital yang elegan di mana desain bertemu teknologi. Saya membangun aplikasi web yang indah, cepat, dan aksesibel yang meninggalkan kesan mendalam.",
  available: "Tersedia untuk proyek freelance",
  cta1: "Lihat Karya Saya",
  cta2: "Hubungi Saya",
};

export default function HeroSection() {
  const { content, updateContent } = useContent();
  const hero = (content.hero as typeof defaultHero) || defaultHero;
  const { isAdmin } = useAdmin();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(defaultHero);
  const [saving, setSaving] = useState(false);

  const handleEditOpen = () => {
    setForm({ ...hero });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("hero", form);
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditOpen}
          className="absolute top-24 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          aria-label="Edit seksi"
        >
          <Pencil className="size-4" />
        </button>
      )}

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-30"
        style={{ backgroundImage: "url(/hero-bg.png)" }}
      />
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent"
        >
          <Sparkles className="size-4" />
          {hero.available}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground"
        >
          {hero.name?.split(" ")[0] || "Alex"}{" "}
          <span className="text-accent">
            {hero.name?.split(" ").slice(1).join(" ") || "Morgan"}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-muted-foreground"
        >
          {hero.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-muted-foreground/80 leading-relaxed"
        >
          {hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => handleScrollTo("#portfolio")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg cursor-pointer min-h-[44px] px-8"
          >
            {hero.cta1}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleScrollTo("#contact")}
            className="border-accent/40 text-accent hover:bg-accent/10 min-h-[44px] px-8 cursor-pointer"
          >
            {hero.cta2}
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-xs tracking-widest uppercase">Gulir</span>
          <ArrowDown className="size-4" />
        </motion.div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Hero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tagline</label>
              <Textarea
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ketersediaan</label>
              <Input
                value={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tombol CTA 1</label>
              <Input
                value={form.cta1}
                onChange={(e) => setForm({ ...form, cta1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tombol CTA 2</label>
              <Input
                value={form.cta2}
                onChange={(e) => setForm({ ...form, cta2: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
