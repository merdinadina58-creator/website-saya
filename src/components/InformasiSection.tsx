"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Trash2,
  Pencil,
  Pin,
  PinOff,
  Calendar,
  Tag,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAdmin } from "@/components/AdminProvider";

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  SPMB: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Kelulusan:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Penting:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  Umum: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
};

const CATEGORIES = ["Umum", "SPMB", "Kelulusan", "Penting"];

function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category] ||
    "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(dateStr);
}

export default function InformasiSection() {
  const { isAdmin, getAuthHeaders } = useAdmin();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    content: "",
    category: "Umum",
    pinned: false,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Announcement | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (e) {
      console.error("Failed to load announcements:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleAdd = async () => {
    if (!addForm.title.trim() || !addForm.content.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setAddForm({ title: "", content: "", category: "Umum", pinned: false });
        setAddOpen(false);
      }
    } catch (e) {
      console.error("Failed to create announcement:", e);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm || !editForm.title.trim() || !editForm.content.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/announcements/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          category: editForm.category,
          pinned: editForm.pinned,
        }),
      });
      if (res.ok) {
        await fetchAnnouncements();
        setEditOpen(false);
        setEditForm(null);
      }
    } catch (e) {
      console.error("Failed to update announcement:", e);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/announcements/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      if (res.ok) {
        await fetchAnnouncements();
        setDeleteTarget(null);
      }
    } catch (e) {
      console.error("Failed to delete announcement:", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ pinned: !announcement.pinned }),
      });
      if (res.ok) {
        await fetchAnnouncements();
      }
    } catch (e) {
      console.error("Failed to toggle pin:", e);
    }
  };

  // Filter announcements
  const filtered = announcements.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || a.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedItems = filtered.filter((a) => a.pinned);
  const regularItems = filtered.filter((a) => !a.pinned);

  return (
    <section
      id="informasi"
      className="relative py-20 sm:py-28 bg-muted/30"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
            <Megaphone className="size-4" />
            Pengumuman & Informasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Informasi <span className="text-accent">Terbaru</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Pengumuman kelulusan SPMB dan informasi penting lainnya
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filterCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory("")}
              className={
                filterCategory === ""
                  ? "bg-accent text-accent-foreground hover:bg-accent/90"
                  : ""
              }
            >
              Semua
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className={
                  filterCategory === cat
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                }
              >
                {cat}
              </Button>
            ))}
            {isAdmin && (
              <Button
                size="sm"
                onClick={() => {
                  setAddForm({
                    title: "",
                    content: "",
                    category: "Umum",
                    pinned: false,
                  });
                  setAddOpen(true);
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="size-4 mr-1" />
                Tambah
              </Button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 text-accent animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
              <AlertCircle className="size-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              Belum ada pengumuman
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || filterCategory
                ? "Coba ubah filter pencarian Anda"
                : "Pengumuman akan muncul di sini"}
            </p>
            {isAdmin && !searchQuery && !filterCategory && (
              <Button
                className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => setAddOpen(true)}
              >
                <Plus className="size-4 mr-1" />
                Buat Pengumuman Pertama
              </Button>
            )}
          </motion.div>
        )}

        {/* Pinned Announcements */}
        {!loading && pinnedItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin className="size-4 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                Disematkan
              </span>
            </div>
            <div className="space-y-4">
              {pinnedItems.map((item, index) => (
                <AnnouncementCard
                  key={item.id}
                  announcement={item}
                  index={index}
                  isAdmin={isAdmin}
                  onEdit={(a) => {
                    setEditForm({ ...a });
                    setEditOpen(true);
                  }}
                  onDelete={setDeleteTarget}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Announcements */}
        {!loading && regularItems.length > 0 && (
          <div>
            {pinnedItems.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Pengumuman
                </span>
              </div>
            )}
            <div className="space-y-4">
              {regularItems.map((item, index) => (
                <AnnouncementCard
                  key={item.id}
                  announcement={item}
                  index={index}
                  isAdmin={isAdmin}
                  onEdit={(a) => {
                    setEditForm({ ...a });
                    setEditOpen(true);
                  }}
                  onDelete={setDeleteTarget}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Add Announcement Dialog ─── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5 text-accent" />
              Tambah Pengumuman
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="add-title" className="text-sm font-medium">
                Judul Pengumuman
              </label>
              <Input
                id="add-title"
                placeholder="Contoh: Pengumuman Kelulusan SPMB 2025"
                value={addForm.title}
                onChange={(e) =>
                  setAddForm({ ...addForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="add-category" className="text-sm font-medium">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, category: cat })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      addForm.category === cat
                        ? getCategoryColor(cat) + " border-current"
                        : "border-border text-muted-foreground hover:border-accent/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="add-content" className="text-sm font-medium">
                Isi Pengumuman
              </label>
              <Textarea
                id="add-content"
                placeholder="Tulis isi pengumuman di sini..."
                value={addForm.content}
                onChange={(e) =>
                  setAddForm({ ...addForm, content: e.target.value })
                }
                rows={5}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="add-pinned"
                checked={addForm.pinned}
                onChange={(e) =>
                  setAddForm({ ...addForm, pinned: e.target.checked })
                }
                className="size-4 rounded border-border accent-accent"
              />
              <label
                htmlFor="add-pinned"
                className="text-sm font-medium flex items-center gap-1.5"
              >
                <Pin className="size-3" />
                Sematkan pengumuman ini
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleAdd}
              disabled={
                !addForm.title.trim() || !addForm.content.trim() || addLoading
              }
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {addLoading ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="size-4 mr-1" />
                  Tambah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Announcement Dialog ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-5 text-accent" />
              Edit Pengumuman
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Judul Pengumuman
                </label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setEditForm({ ...editForm, category: cat })
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        editForm.category === cat
                          ? getCategoryColor(cat) + " border-current"
                          : "border-border text-muted-foreground hover:border-accent/50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-content" className="text-sm font-medium">
                  Isi Pengumuman
                </label>
                <Textarea
                  id="edit-content"
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  rows={5}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-pinned"
                  checked={editForm.pinned}
                  onChange={(e) =>
                    setEditForm({ ...editForm, pinned: e.target.checked })
                  }
                  className="size-4 rounded border-border accent-accent"
                />
                <label
                  htmlFor="edit-pinned"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Pin className="size-3" />
                  Sematkan pengumuman ini
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              onClick={handleEdit}
              disabled={
                !editForm?.title.trim() ||
                !editForm?.content.trim() ||
                editLoading
              }
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {editLoading ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Hapus Pengumuman
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Apakah Anda yakin ingin menghapus pengumuman{" "}
            <strong className="text-foreground">
              &ldquo;{deleteTarget?.title}&rdquo;
            </strong>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-1" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ─── Announcement Card Component ───
function AnnouncementCard({
  announcement,
  index,
  isAdmin,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  announcement: Announcement;
  index: number;
  isAdmin: boolean;
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
  onTogglePin: (a: Announcement) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative rounded-xl border bg-card p-5 sm:p-6 transition-all duration-300 hover:shadow-md ${
        announcement.pinned
          ? "border-accent/30 bg-accent/5"
          : "border-border hover:border-accent/20"
      }`}
    >
      {/* Admin Controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin(announcement)}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            aria-label={announcement.pinned ? "Lepas sematan" : "Sematkan"}
          >
            {announcement.pinned ? (
              <PinOff className="size-4" />
            ) : (
              <Pin className="size-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(announcement)}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
            aria-label="Edit pengumuman"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => onDelete(announcement)}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Hapus pengumuman"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Megaphone className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight pr-8 sm:pr-20">
            {announcement.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0 h-5 ${getCategoryColor(
                announcement.category
              )}`}
            >
              <Tag className="size-2.5 mr-1" />
              {announcement.category}
            </Badge>
            {announcement.pinned && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 bg-accent/10 text-accent border-accent/20"
              >
                <Pin className="size-2.5 mr-1" />
                Disematkan
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="ml-0 sm:ml-13">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {announcement.content}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/70">
          <Calendar className="size-3" />
          <time dateTime={announcement.createdAt}>
            {formatRelativeTime(announcement.createdAt)}
          </time>
          {formatRelativeTime(announcement.createdAt) !==
            formatDate(announcement.createdAt) && (
            <span className="hidden sm:inline">
              &nbsp;· {formatDate(announcement.createdAt)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
