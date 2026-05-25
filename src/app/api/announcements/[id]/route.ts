import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

// DELETE /api/announcements/[id] — Admin only: delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Try database first
    try {
      if (await isDbAvailable()) {
        const announcement = await db.announcement.findUnique({ where: { id } });
        if (announcement) {
          await db.announcement.delete({ where: { id } });
          return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
        }
      }
    } catch {
      markDbUnavailable();
    }

    // If not in DB or DB unavailable, still return success
    // (frontend will remove from localStorage)
    return NextResponse.json({ message: "Pengumuman berhasil dihapus", savedToDb: false });
  } catch {
    return NextResponse.json(
      { error: "Gagal menghapus pengumuman" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id] — Admin only: update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, category, pinned } = body;

    // Try database first
    try {
      if (await isDbAvailable()) {
        const announcement = await db.announcement.findUnique({ where: { id } });
        if (announcement) {
          const updated = await db.announcement.update({
            where: { id },
            data: {
              ...(title !== undefined && { title: title.trim() }),
              ...(content !== undefined && { content: content.trim() }),
              ...(category !== undefined && { category: category.trim() }),
              ...(pinned !== undefined && { pinned: !!pinned }),
            },
          });
          return NextResponse.json(updated);
        }
      }
    } catch {
      markDbUnavailable();
    }

    // DB not available — return updated data so frontend can update localStorage
    const now = new Date().toISOString();
    const updated = {
      id,
      title: title?.trim() || "",
      content: content?.trim() || "",
      category: category?.trim() || "Umum",
      pinned: !!pinned,
      updatedAt: now,
      savedToDb: false,
    };

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Gagal memperbarui pengumuman" },
      { status: 500 }
    );
  }
}
