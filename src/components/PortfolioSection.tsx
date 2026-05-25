"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Pencil, Plus, Trash2 } from "lucide-react";
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

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  darkGradient: string;
}

interface PortfolioData {
  subtitle: string;
  title: string;
  description: string;
  projects: Project[];
}

const defaultPortfolio: PortfolioData = {
  subtitle: "Portofolio",
  title: "Proyek Pilihan",
  description:
    "Pilihan kurasi proyek yang menampilkan kemampuan saya dalam desain, pengembangan, dan pemecahan masalah.",
  projects: [
    {
      id: "p1",
      title: "Lumina Dashboard",
      description:
        "Dashboard analitik real-time dengan visualisasi data interaktif dan dukungan mode gelap.",
      tags: ["React", "D3.js", "TypeScript"],
      gradient: "from-amber-400/80 to-orange-500/80",
      darkGradient: "dark:from-amber-600/40 dark:to-orange-700/40",
    },
    {
      id: "p2",
      title: "Verdant Store",
      description:
        "Platform e-commerce dengan alur checkout yang mulus dan katalog produk responsif.",
      tags: ["Next.js", "Stripe", "Prisma"],
      gradient: "from-emerald-400/80 to-teal-500/80",
      darkGradient: "dark:from-emerald-600/40 dark:to-teal-700/40",
    },
    {
      id: "p3",
      title: "Synthwave Player",
      description:
        "UI streaming musik dengan visualisasi gelombang suara dan manajemen playlist.",
      tags: ["Vue.js", "Web Audio", "Tailwind"],
      gradient: "from-rose-400/80 to-pink-500/80",
      darkGradient: "dark:from-rose-600/40 dark:to-pink-700/40",
    },
    {
      id: "p4",
      title: "Atlas Maps",
      description:
        "Aplikasi pemetaan interaktif dengan penanda kustom dan optimasi rute.",
      tags: ["React", "Mapbox", "Node.js"],
      gradient: "from-sky-400/80 to-cyan-500/80",
      darkGradient: "dark:from-sky-600/40 dark:to-cyan-700/40",
    },
    {
      id: "p5",
      title: "Noctis Blog",
      description:
        "Platform blog minimalis dengan pengeditan markdown dan optimasi SEO.",
      tags: ["Next.js", "MDX", "Vercel"],
      gradient: "from-violet-400/80 to-purple-500/80",
      darkGradient: "dark:from-violet-600/40 dark:to-purple-700/40",
    },
    {
      id: "p6",
      title: "Forge CMS",
      description:
        "Sistem manajemen konten headless dengan pembangun halaman seret dan lepas.",
      tags: ["TypeScript", "GraphQL", "React"],
      gradient: "from-yellow-400/80 to-amber-500/80",
      darkGradient: "dark:from-yellow-600/40 dark:to-amber-700/40",
    },
  ],
};

export default function PortfolioSection() {
  const { content, updateContent } = useContent();
  const portfolio = (content.portfolio as PortfolioData) || defaultPortfolio;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<PortfolioData>(defaultPortfolio);
  const [saving, setSaving] = useState(false);

  const handleEditOpen = () => {
    setForm(JSON.parse(JSON.stringify(portfolio)));
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("portfolio", form);
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PortfolioData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const addProject = () => {
    setForm({
      ...form,
      projects: [
        ...form.projects,
        {
          id: `p-${Date.now()}`,
          title: "",
          description: "",
          tags: [],
          gradient: "from-amber-400/80 to-orange-500/80",
          darkGradient: "dark:from-amber-600/40 dark:to-orange-700/40",
        },
      ],
    });
  };

  const removeProject = (index: number) => {
    setForm({
      ...form,
      projects: form.projects.filter((_, i) => i !== index),
    });
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string | string[]
  ) => {
    const updated = [...form.projects];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, projects: updated });
  };

  const updateProjectTags = (index: number, tagsStr: string) => {
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    updateProject(index, "tags", tags);
  };

  return (
    <section id="portfolio" className="py-20 sm:py-28 relative" ref={ref}>
      {/* Edit Button */}
      <button
        onClick={handleEditOpen}
        className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        aria-label="Edit seksi"
      >
        <Pencil className="size-4" />
      </button>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {portfolio.subtitle}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            {portfolio.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {portfolio.description}
          </p>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
            >
              <Card className="group h-full overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
                {/* Gradient Image Placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${project.gradient} ${project.darkGradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 size-12 rounded-lg border-2 border-white/40" />
                    <div className="absolute bottom-4 right-4 size-8 rounded-full border-2 border-white/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-xl border border-white/20" />
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-accent transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs hover:bg-accent/20 hover:text-accent transition-colors cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:text-accent min-h-[36px] cursor-pointer"
                  >
                    <Github className="size-3.5 mr-1" />
                    Kode
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:text-accent min-h-[36px] cursor-pointer"
                  >
                    <ExternalLink className="size-3.5 mr-1" />
                    Demo
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Portofolio</DialogTitle>
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

            {/* Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Proyek</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addProject}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah Proyek
                </Button>
              </div>
              {form.projects.map((project, pIdx) => (
                <div
                  key={project.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Proyek {pIdx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(pIdx)}
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={project.title}
                      onChange={(e) =>
                        updateProject(pIdx, "title", e.target.value)
                      }
                      placeholder="Judul proyek"
                    />
                    <Textarea
                      value={project.description}
                      onChange={(e) =>
                        updateProject(pIdx, "description", e.target.value)
                      }
                      placeholder="Deskripsi"
                      rows={2}
                    />
                    <Input
                      value={project.tags.join(", ")}
                      onChange={(e) =>
                        updateProjectTags(pIdx, e.target.value)
                      }
                      placeholder="Tags (pisahkan dengan koma)"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">
                          Gradient (light)
                        </label>
                        <Input
                          value={project.gradient}
                          onChange={(e) =>
                            updateProject(pIdx, "gradient", e.target.value)
                          }
                          placeholder="from-amber-400/80 to-orange-500/80"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">
                          Gradient (dark)
                        </label>
                        <Input
                          value={project.darkGradient}
                          onChange={(e) =>
                            updateProject(
                              pIdx,
                              "darkGradient",
                              e.target.value
                            )
                          }
                          placeholder="dark:from-amber-600/40 dark:to-orange-700/40"
                        />
                      </div>
                    </div>
                  </div>
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
