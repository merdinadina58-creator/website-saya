import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

// GET /api/announcements — Public: list all announcements
export async function GET() {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json([]);
    }
    const announcements = await db.announcement.findMany({
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    markDbUnavailable();
    // Return empty array so the frontend shows "Belum ada pengumuman"
    return NextResponse.json([]);
  }
}

// POST /api/announcements — Admin only: create announcement
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, content, category, pinned } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan isi pengumuman wajib diisi" },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: (category || "Umum").trim(),
        pinned: !!pinned,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal membuat pengumuman" },
      { status: 500 }
    );
  }
}
