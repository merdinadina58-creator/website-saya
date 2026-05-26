"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Pencil, Plus, Trash2, ImagePlus, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useContent } from "@/components/ContentProvider";
import { useAdmin } from "@/components/AdminProvider";
import { useToast } from "@/hooks/use-toast";

interface Stat {
  value: string;
  label: string;
}

const defaultAbout = {
  heading:
    "Seorang developer dengan mata desainer dan passion untuk kode bersih.",
  paragraphs: [
    "Saya {name}, seorang developer kreatif dan desainer yang berbasis di Jakarta. Dengan pengalaman lebih dari lima tahun, saya spesialisasi dalam membangun aplikasi web yang indah dan berkinerja tinggi yang menjembatani kesenjangan antara estetika dan fungsionalitas.",
    "Perjalanan saya dimulai dari desain grafis, yang memberikan saya perspektif unik tentang pengalaman pengguna. Saya percaya bahwa perangkat lunak yang hebat tidak hanya harus berfungsi — tetapi juga harus memberikan kegembiraan. Setiap proyek yang saya ambil adalah kesempatan untuk menciptakan sesuatu yang bermakna dan berkesan.",
    "Saat tidak coding, Anda akan menemukan saya menjelajahi tipografi, bereksperimen dengan seni generatif, atau mendaki jalur pegunungan di Indonesia.",
  ],
  stats: [
    { value: "5+", label: "Tahun Pengalaman" },
    { value: "50+", label: "Proyek Selesai" },
    { value: "30+", label: "Klien Puas" },
    { value: "12", label: "Penghargaan" },
  ],
};

// localStorage key for about photo persistence
const ABOUT_PHOTO_LS_KEY = "website-about-photo";

function loadAboutPhoto(): string | null {
  try {
    const stored = localStorage.getItem(ABOUT_PHOTO_LS_KEY);
    if (stored) return stored;
  } catch {}
  return null;
}

function saveAboutPhoto(dataUrl: string | null) {
  try {
    if (dataUrl) {
      localStorage.setItem(ABOUT_PHOTO_LS_KEY, dataUrl);
    } else {
      localStorage.removeItem(ABOUT_PHOTO_LS_KEY);
    }
  } catch {
    // localStorage might be full
  }
}

export default function AboutSection() {
  const { content, updateContent } = useContent();
  const rawAbout = content.about as Partial<typeof defaultAbout> | undefined;
  const about = {
    ...defaultAbout,
    ...rawAbout,
    paragraphs: rawAbout?.paragraphs || defaultAbout.paragraphs,
    stats: rawAbout?.stats || defaultAbout.stats,
  };
  const hero = content.hero as { name?: string } | undefined;
  const displayName = hero?.name || "Alex Morgan";
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(defaultAbout);
  const [saving, setSaving] = useState(false);

  // Profile photo state
  const [photoSrc, setPhotoSrc] = useState<string>("/avatar.png");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const photoFileRef = useRef<HTMLInputElement>(null);

  // Load profile photo from localStorage on mount
  useEffect(() => {
    const localPhoto = loadAboutPhoto();
    if (localPhoto) {
      setPhotoSrc(localPhoto);
    }
  }, []);

  // Profile photo upload handler
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 3 * 1024 * 1024) {
      setPhotoError(`Ukuran file maksimal 3MB. File Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Format file tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.");
      return;
    }

    setPhotoUploading(true);
    setPhotoError("");

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPhotoSrc(dataUrl);
        saveAboutPhoto(dataUrl);
        setPhotoUploading(false);
        toast({ title: "Berhasil", description: "Foto profil berhasil diubah" });
      };
      reader.onerror = () => {
        setPhotoError("Gagal membaca file. Coba lagi.");
        setPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setPhotoError("Gagal mengupload foto. Coba lagi.");
      setPhotoUploading(false);
    }

    // Reset file input
    if (photoFileRef.current) photoFileRef.current.value = "";
  }, [toast]);

  // Remove profile photo (revert to default)
  const handlePhotoRemove = useCallback(() => {
    setPhotoSrc("/avatar.png");
    saveAboutPhoto(null);
    toast({ title: "Berhasil", description: "Foto profil dikembalikan ke default" });
  }, [toast]);

  const handleEditOpen = () => {
    setForm({
      heading: about.heading,
      paragraphs: [...about.paragraphs],
      stats: about.stats.map((s) => ({ ...s })),
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("about", form);
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Konten berhasil diperbarui" });
    } catch (e) {
      toast({ title: "Gagal", description: e instanceof Error ? e.message : "Gagal menyimpan konten", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addParagraph = () => {
    setForm({ ...form, paragraphs: [...form.paragraphs, ""] });
  };

  const removeParagraph = (index: number) => {
    setForm({
      ...form,
      paragraphs: form.paragraphs.filter((_, i) => i !== index),
    });
  };

  const updateParagraph = (index: number, value: string) => {
    const updated = [...form.paragraphs];
    updated[index] = value;
    setForm({ ...form, paragraphs: updated });
  };

  const addStat = () => {
    setForm({
      ...form,
      stats: [...form.stats, { value: "", label: "" }],
    });
  };

  const removeStat = (index: number) => {
    setForm({
      ...form,
      stats: form.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const updated = [...form.stats];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, stats: updated });
  };

  // Determine if the photo is custom or default
  const isCustomPhoto = photoSrc !== "/avatar.png";

  return (
    <section id="about" className="py-20 sm:py-28 relative" ref={ref}>
      {/* Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditOpen}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 transition-colors animate-pulse"
          aria-label="Edit seksi tentang"
          style={{ animationDuration: "3s", animationIterationCount: "2" }}
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Tentang Saya
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Passion Bertemu Tujuan
          </h2>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={false}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto lg:mx-0 max-w-sm"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl group">
              {isCustomPhoto ? (
                // Custom photo: use regular img tag (supports data URLs)
                <img
                  src={photoSrc}
                  alt={`${displayName} — Developer Kreatif & Desainer`}
                  className="w-full h-full object-cover"
                />
              ) : (
                // Default photo: use Next.js Image for optimization
                <Image
                  src="/avatar.png"
                  alt={`${displayName} — Developer Kreatif & Desainer`}
                  fill
                  sizes="(max-width: 640px) 100vw, 384px"
                  className="object-cover"
                  priority
                />
              )}

              {/* Admin photo overlay */}
              {isAdmin && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    aria-label="Upload foto profil"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => photoFileRef.current?.click()}
                    disabled={photoUploading}
                    className="gap-1.5"
                  >
                    {photoUploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="size-3.5" />
                    )}
                    {photoUploading ? "Mengupload..." : "Ganti Foto"}
                  </Button>
                  {isCustomPhoto && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handlePhotoRemove}
                      className="gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus Foto
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Photo upload error */}
            {photoError && (
              <p className="text-xs text-destructive mt-2 text-center">{photoError}</p>
            )}

            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-accent/30" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={false}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
              {about.heading}
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {about.paragraphs.map((p, i) => (
                <p key={i}>{p.replace(/{name}/g, displayName)}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={false}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {about.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <Card className="text-center border-border/50 bg-card/50 hover:border-accent/30 transition-colors">
                <CardContent className="pt-6">
                  <p className="text-3xl sm:text-4xl font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tentang</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul Utama</label>
              <Input
                value={form.heading}
                onChange={(e) =>
                  setForm({ ...form, heading: e.target.value })
                }
              />
            </div>

            {/* Paragraphs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Paragraf</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParagraph}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah
                </Button>
              </div>
              {form.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={p}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParagraph(i)}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Statistik</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addStat}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah
                </Button>
              </div>
              {form.stats.map((stat, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(i, "value", e.target.value)}
                    placeholder="Nilai"
                    className="w-24"
                  />
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStat(i)}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
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
