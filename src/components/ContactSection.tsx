"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Send,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  href: string | null;
}

interface ContactSocial {
  icon: string;
  label: string;
  url: string;
}

interface ContactData {
  subtitle: string;
  title: string;
  description: string;
  heading: string;
  infoText: string;
  followLabel: string;
  items: ContactItem[];
  socials: ContactSocial[];
}

const defaultContact: ContactData = {
  subtitle: "Kontak",
  title: "Mari Berkolaborasi",
  description:
    "Punya proyek di pikiran atau sekadar ingin menyapa? Saya akan senang mendengar dari Anda. Mari ciptakan sesuatu yang luar biasa.",
  heading: "Hubungi Saya",
  infoText:
    "Baik Anda punya pertanyaan, ide kolaborasi, atau sekadar ingin terhubung — kotak masuk saya selalu terbuka. Saya berusaha merespons dalam 24 jam.",
  followLabel: "Ikuti Saya",
  items: [
    {
      icon: "Mail",
      label: "Email",
      value: "alex@morgan.dev",
      href: "mailto:alex@morgan.dev",
    },
    {
      icon: "MapPin",
      label: "Lokasi",
      value: "Jakarta, Indonesia",
      href: null,
    },
  ],
  socials: [
    { icon: "Github", label: "GitHub", url: "#" },
    { icon: "Linkedin", label: "LinkedIn", url: "#" },
    { icon: "Twitter", label: "Twitter", url: "#" },
  ],
};

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="size-5" />,
  MapPin: <MapPin className="size-5" />,
};

const socialIconMap: Record<string, React.ReactNode> = {
  Github: <Github className="size-5" />,
  Linkedin: <Linkedin className="size-5" />,
  Twitter: <Twitter className="size-5" />,
};

export default function ContactSection() {
  const { content, updateContent } = useContent();
  const rawContact = content.contact as Partial<ContactData> | undefined;
  const contact: ContactData = {
    ...defaultContact,
    ...rawContact,
    items: rawContact?.items || defaultContact.items,
    socials: rawContact?.socials || defaultContact.socials,
  };
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<ContactData>(defaultContact);
  const [saving, setSaving] = useState(false);

  const handleEditOpen = () => {
    setForm(JSON.parse(JSON.stringify(contact)));
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("contact", form);
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Konten berhasil diperbarui" });
    } catch (e) {
      toast({ title: "Gagal", description: e instanceof Error ? e.message : "Gagal menyimpan konten", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ContactData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const addContactItem = () => {
    setForm({
      ...form,
      items: [...form.items, { icon: "Mail", label: "", value: "", href: null }],
    });
  };

  const removeContactItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateContactItem = (
    index: number,
    field: keyof ContactItem,
    value: string | null
  ) => {
    const updated = [...form.items];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, items: updated });
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
    field: keyof ContactSocial,
    value: string
  ) => {
    const updated = [...form.socials];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, socials: updated });
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-muted/30 relative" ref={ref}>
      {/* Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditOpen}
          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/30 transition-colors animate-pulse"
          aria-label="Edit seksi kontak"
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
            {contact.subtitle}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            {contact.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {contact.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={false}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">
              {contact.heading}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {contact.infoText}
            </p>

            <div className="space-y-4 mb-8">
              {contact.items.map((info) => (
                <div key={info.label} className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                    {iconMap[info.icon] || <Mail className="size-5" />}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div>
              <p className="text-sm font-medium text-foreground mb-4">
                {contact.followLabel}
              </p>
              <div className="flex gap-3">
                {contact.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-lg border border-border hover:border-accent/40 text-muted-foreground hover:text-accent transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
                  >
                    {socialIconMap[social.icon] || (
                      <Github className="size-5" />
                    )}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={false}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Nama
                      </label>
                      <Input
                        id="name"
                        placeholder="Nama Anda"
                        className="border-border/60 focus:border-accent/60 min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="anda@contoh.com"
                        className="border-border/60 focus:border-accent/60 min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Subjek
                    </label>
                    <Input
                      id="subject"
                      placeholder="Pertanyaan proyek"
                      className="border-border/60 focus:border-accent/60 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Pesan
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Ceritakan tentang proyek Anda..."
                      rows={5}
                      className="border-border/60 focus:border-accent/60 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg min-h-[44px] cursor-pointer"
                  >
                    <Send className="size-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kontak</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subjudul</label>
              <Input
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul</label>
              <Input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Heading Info</label>
              <Input
                value={form.heading}
                onChange={(e) => updateField("heading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Teks Info</label>
              <Textarea
                value={form.infoText}
                onChange={(e) => updateField("infoText", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Label Ikuti</label>
              <Input
                value={form.followLabel}
                onChange={(e) => updateField("followLabel", e.target.value)}
              />
            </div>

            {/* Contact Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Info Kontak</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addContactItem}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah
                </Button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start border rounded-lg p-3">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={item.icon}
                        onChange={(e) =>
                          updateContactItem(i, "icon", e.target.value)
                        }
                        placeholder="Ikon (Mail/MapPin)"
                      />
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          updateContactItem(i, "label", e.target.value)
                        }
                        placeholder="Label"
                      />
                    </div>
                    <Input
                      value={item.value}
                      onChange={(e) =>
                        updateContactItem(i, "value", e.target.value)
                      }
                      placeholder="Nilai"
                    />
                    <Input
                      value={item.href || ""}
                      onChange={(e) =>
                        updateContactItem(
                          i,
                          "href",
                          e.target.value || null
                        )
                      }
                      placeholder="Link (opsional)"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeContactItem(i)}
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
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
                    onChange={(e) =>
                      updateSocial(i, "icon", e.target.value)
                    }
                    placeholder="Ikon (Github/Linkedin/Twitter)"
                    className="w-40"
                  />
                  <Input
                    value={social.label}
                    onChange={(e) =>
                      updateSocial(i, "label", e.target.value)
                    }
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    value={social.url}
                    onChange={(e) =>
                      updateSocial(i, "url", e.target.value)
                    }
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
    </section>
  );
}
