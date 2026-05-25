import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

// GET /api/announcements — Public: list all announcements
export async function GET() {
  try {
    if (await isDbAvailable()) {
      const announcements = await db.announcement.findMany({
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(announcements);
    }
  } catch {
    markDbUnavailable();
  }
  // DB not available — return empty array
  return NextResponse.json([]);
}

// POST /api/announcements — Admin only: create announcement
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, pinned, id, createdAt, updatedAt } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan isi pengumuman wajib diisi" },
        { status: 400 }
      );
    }

    // Try to save to database
    let savedToDb = false;
    try {
      if (await isDbAvailable()) {
        const announcement = await db.announcement.create({
          data: {
            title: title.trim(),
            content: content.trim(),
            category: (category || "Umum").trim(),
            pinned: !!pinned,
          },
        });
        return NextResponse.json(announcement, { status: 201 });
      }
    } catch {
      markDbUnavailable();
    }

    // DB not available — return the announcement data so frontend can save to localStorage
    const now = new Date().toISOString();
    const announcement = {
      id: id || `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      title: title.trim(),
      content: content.trim(),
      category: (category || "Umum").trim(),
      pinned: !!pinned,
      createdAt: createdAt || now,
      updatedAt: updatedAt || now,
      savedToDb: false,
    };

    return NextResponse.json(announcement, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat pengumuman" },
      { status: 500 }
    );
  }
}
