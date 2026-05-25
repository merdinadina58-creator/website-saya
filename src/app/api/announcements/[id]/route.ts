import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

// DELETE /api/announcements/[id] — Admin only: delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia di lingkungan ini." },
        { status: 503 }
      );
    }

    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const announcement = await db.announcement.findUnique({ where: { id } });

    if (!announcement) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.announcement.delete({ where: { id } });

    return NextResponse.json({ message: "Pengumuman berhasil dihapus" });
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    markDbUnavailable();
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
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia di lingkungan ini. Fitur edit hanya tersedia di server lokal." },
        { status: 503 }
      );
    }

    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, category, pinned } = body;

    const announcement = await db.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan" },
        { status: 404 }
      );
    }

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
  } catch (error) {
    console.error("Failed to update announcement:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal memperbarui pengumuman" },
      { status: 500 }
    );
  }
}
