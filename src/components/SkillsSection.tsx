"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code2, Server, Palette, Pencil, Plus, Trash2 } from "lucide-react";
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

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  skills: Skill[];
  tags: string[];
}

interface SkillsData {
  subtitle: string;
  title: string;
  description: string;
  categories: SkillCategory[];
}

const defaultSkills: SkillsData = {
  subtitle: "Keahlian & Spesialisasi",
  title: "Yang Saya Bisa Berikan",
  description:
    "Kemampuan serba bisa yang mencakup pengembangan frontend, rekayasa backend, dan desain UI/UX — memungkinkan saya memberikan solusi digital yang lengkap.",
  categories: [
    {
      id: "frontend",
      title: "Frontend",
      icon: "Code2",
      skills: [
        { name: "React / Next.js", level: 95 },
        { name: "TypeScript", level: 90 },
        { name: "Tailwind CSS", level: 92 },
        { name: "Framer Motion", level: 85 },
      ],
      tags: ["React", "Next.js", "TypeScript", "Vue", "Tailwind", "Framer Motion"],
    },
    {
      id: "backend",
      title: "Backend",
      icon: "Server",
      skills: [
        { name: "Node.js", level: 88 },
        { name: "PostgreSQL", level: 82 },
        { name: "REST / GraphQL", level: 86 },
        { name: "Docker / CI/CD", level: 78 },
      ],
      tags: ["Node.js", "Python", "PostgreSQL", "GraphQL", "Docker", "AWS"],
    },
    {
      id: "design",
      title: "Desain",
      icon: "Palette",
      skills: [
        { name: "Desain UI/UX", level: 90 },
        { name: "Figma", level: 92 },
        { name: "Sistem Desain", level: 87 },
        { name: "Prototipe", level: 84 },
      ],
      tags: ["Figma", "UI/UX", "Sistem Desain", "Prototipe", "Tipografi", "Ilustrasi"],
    },
  ],
};

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 className="size-5" />,
  Server: <Server className="size-5" />,
  Palette: <Palette className="size-5" />,
};

export default function SkillsSection() {
  const { content, updateContent } = useContent();
  const skills = (content.skills as unknown as SkillsData) || defaultSkills;
  const { isAdmin } = useAdmin();

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<SkillsData>(defaultSkills);
  const [saving, setSaving] = useState(false);

  const handleEditOpen = () => {
    setForm(JSON.parse(JSON.stringify(skills)));
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent("skills", form);
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SkillsData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const addCategory = () => {
    setForm({
      ...form,
      categories: [
        ...form.categories,
        { id: `cat-${Date.now()}`, title: "", icon: "Code2", skills: [], tags: [] },
      ],
    });
  };

  const removeCategory = (index: number) => {
    setForm({
      ...form,
      categories: form.categories.filter((_, i) => i !== index),
    });
  };

  const updateCategory = (
    index: number,
    field: keyof SkillCategory,
    value: string
  ) => {
    const updated = [...form.categories];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, categories: updated });
  };

  const addSkill = (catIndex: number) => {
    const updated = [...form.categories];
    updated[catIndex].skills = [
      ...updated[catIndex].skills,
      { name: "", level: 50 },
    ];
    setForm({ ...form, categories: updated });
  };

  const removeSkill = (catIndex: number, skillIndex: number) => {
    const updated = [...form.categories];
    updated[catIndex].skills = updated[catIndex].skills.filter(
      (_, i) => i !== skillIndex
    );
    setForm({ ...form, categories: updated });
  };

  const updateSkill = (
    catIndex: number,
    skillIndex: number,
    field: keyof Skill,
    value: string | number
  ) => {
    const updated = [...form.categories];
    updated[catIndex].skills[skillIndex] = {
      ...updated[catIndex].skills[skillIndex],
      [field]: value,
    };
    setForm({ ...form, categories: updated });
  };

  const updateTags = (catIndex: number, tagsStr: string) => {
    const updated = [...form.categories];
    updated[catIndex].tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setForm({ ...form, categories: updated });
  };

  return (
    <section id="skills" className="py-20 sm:py-28 bg-muted/30 relative" ref={ref}>
      {/* Edit Button */}
      {isAdmin && (
        <button
          onClick={handleEditOpen}
          className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          aria-label="Edit seksi"
        >
          <Pencil className="size-4" />
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
            {skills.subtitle}
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            {skills.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {skills.description}
          </p>
        </motion.div>

        {/* Skill Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.categories.map((category, catIdx) => (
            <motion.div
              key={category.id}
              initial={false}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + catIdx * 0.15 }}
            >
              <Card className="h-full border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 group">
                <CardContent className="pt-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      {iconMap[category.icon] || <Code2 className="size-5" />}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.title}
                    </h3>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-4 mb-6">
                    {category.skills.map((skill, skillIdx) => (
                      <motion.div
                        key={skill.name}
                        initial={false}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.4 + catIdx * 0.15 + skillIdx * 0.08,
                        }}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {skill.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {skill.level}%
                          </span>
                        </div>
                        <Progress
                          value={isInView ? skill.level : 0}
                          className="h-2 transition-all duration-1000"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag) => (
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
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Keahlian</DialogTitle>
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

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Kategori</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCategory}
                  className="text-xs"
                >
                  <Plus className="size-3 mr-1" /> Tambah Kategori
                </Button>
              </div>
              {form.categories.map((cat, catIdx) => (
                <div
                  key={cat.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Kategori {catIdx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCategory(catIdx)}
                      className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Judul</label>
                      <Input
                        value={cat.title}
                        onChange={(e) =>
                          updateCategory(catIdx, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Ikon (Code2/Server/Palette)</label>
                      <Input
                        value={cat.icon}
                        onChange={(e) =>
                          updateCategory(catIdx, "icon", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Skills in category */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Keahlian</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSkill(catIdx)}
                        className="text-xs"
                      >
                        <Plus className="size-3 mr-1" /> Tambah
                      </Button>
                    </div>
                    {cat.skills.map((skill, skillIdx) => (
                      <div key={skillIdx} className="flex gap-2 items-center">
                        <Input
                          value={skill.name}
                          onChange={(e) =>
                            updateSkill(catIdx, skillIdx, "name", e.target.value)
                          }
                          placeholder="Nama"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={skill.level}
                          onChange={(e) =>
                            updateSkill(
                              catIdx,
                              skillIdx,
                              "level",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSkill(catIdx, skillIdx)}
                          className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Tags (pisahkan dengan koma)
                    </label>
                    <Input
                      value={cat.tags.join(", ")}
                      onChange={(e) => updateTags(catIdx, e.target.value)}
                    />
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
