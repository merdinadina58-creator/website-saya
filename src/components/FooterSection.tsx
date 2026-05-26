"use client";

import { useState } from "react";
import { Github, Linkedin, Twitter, ArrowUp, Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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

interface FooterSocial {
  icon: string;
  label: string;
  url: string;
}

interface FooterData {
  brandName: string;
  brandAccent: string;
  subtitle: string;
  copyright: string;
  madeWith: string;
  socials: FooterSocial[];
}

const defaultFooter: FooterData = {
  brandName: "Alex",
  brandAccent: "Morgan",
  subtitle: "Developer Kreatif & Desainer",
  copyright: "Semua hak dilindungi.",
  madeWith: "Dibuat dengan ❤ dan banyak kopi",
  socials: [
    { icon: "Github", label: "GitHub", url: "#" },
    { icon: "Linkedin", label: "LinkedIn", url: "#" },
    { icon: "Twitter", label: "Twitter", url: "#" },
  ],
};

const socialIconMap: Record<string, React.ReactNode> = {
  Github: <Github className="size-4" />,
  Linkedin: <Linkedin className="size-4" />,
  Twitter: <Twitter className="size-4" />,
};

export default function FooterSection() {
  const { content, updateContent } = useContent();
  const rawFooter = content.footer as Partial<FooterData> | undefined;
  const footer: FooterData = {
    ...defaultFooter,
    ...rawFooter,
    socials: rawFooter?.socials || defaultFooter.socials,
  };
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<FooterData>(defaultFooter);
  const [saving, setSaving] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditOpen = () => {
    setForm(JSON.parse(JSON.stringify(footer)));
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("footer", form);
      // Sync brand name back to hero so everything stays consistent
      const currentHero = (content.hero as Record<string, unknown>) || {};
      await updateContent("hero", {
        ...currentHero,
        name: `${form.brandName} ${form.brandAccent}`.trim(),
      });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Konten berhasil diperbarui" });
    } catch (e) {
      toast({ title: "Gagal", description: e instanceof Error ? e.message : "Gagal menyimpan konten", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof FooterData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const addSocial = () => {
    setForm({
      ...form,
      socials: [...form.socials, { icon: "Github", label: "", url: "#" }],
    });
  };

  const removeSocial = (index: number) => {
    setForm({
      ...form,
      socials: form.socials.filter((_, i) => i !== index),
    });
  };

  const updateSocial = (
    index: number,
    field: keyof FooterSocial,
    value: string
  ) => {
    const updated = [...form.socials];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, socials: updated });
  };

  return (
    <footer className="border-t border-border bg-card/50 relative">
      {/* Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditOpen}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 transition-colors animate-pulse"
          aria-label="Edit seksi footer"
          style={{ animationDuration: "3s", animationIterationCount: "2" }}
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold tracking-tight text-foreground">
              {footer.brandName}
              <span className="text-accent">.</span>
              {footer.brandAccent}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {footer.subtitle}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.url}
                aria-label={social.label}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all duration-300"
              >
                {socialIconMap[social.icon] || <Github className="size-4" />}
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
            &copy; {new Date().getFullYear()} {footer.brandName}{" "}
            {footer.brandAccent}. {footer.copyright}
          </p>
          <p className="flex items-center gap-1">
            {footer.madeWith.includes("❤") ? (
              <>
                {footer.madeWith.split("❤")[0]}
                <Heart className="size-3 text-accent fill-accent" />
                {footer.madeWith.split("❤")[1]}
              </>
            ) : (
              footer.madeWith
            )}
          </p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Footer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Brand</label>
                <Input
                  value={form.brandName}
                  onChange={(e) => updateField("brandName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aksen Brand</label>
                <Input
                  value={form.brandAccent}
                  onChange={(e) => updateField("brandAccent", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subjudul</label>
              <Input
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Hak Cipta</label>
              <Input
                value={form.copyright}
                onChange={(e) => updateField("copyright", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dibuat Dengan</label>
              <Input
                value={form.madeWith}
                onChange={(e) => updateField("madeWith", e.target.value)}
              />
            </div>

            {/* Socials */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Media Sosial</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSocial}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah
                </Button>
              </div>
              {form.socials.map((social, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    value={social.icon}
                    onChange={(e) => updateSocial(i, "icon", e.target.value)}
                    placeholder="Ikon"
                    className="w-32"
                  />
                  <Input
                    value={social.label}
                    onChange={(e) => updateSocial(i, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={social.url}
                    onChange={(e) => updateSocial(i, "url", e.target.value)}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSocial(i)}
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
    </footer>
  );
}
