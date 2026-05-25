import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Konten tidak ditemukan" },
        { status: 404 }
      );
    }

    const { key } = await params;
    const content = await db.siteContent.findUnique({ where: { key } });

    if (!content) {
      return NextResponse.json(
        { error: "Konten tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      key: content.key,
      value: JSON.parse(content.value),
      updatedAt: content.updatedAt,
      createdAt: content.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch content:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Konten tidak ditemukan" },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia di lingkungan ini. Fitur edit hanya tersedia di server lokal." },
        { status: 503 }
      );
    }

    // Auth check
    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { key } = await params;
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      return NextResponse.json(
        { error: "Value wajib diisi" },
        { status: 400 }
      );
    }

    const content = await db.siteContent.upsert({
      where: { key },
      update: {
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
      create: {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
    });

    return NextResponse.json({
      key: content.key,
      value: JSON.parse(content.value),
      updatedAt: content.updatedAt,
    });
  } catch (error) {
    console.error("Failed to update content:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal memperbarui konten" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Database tidak tersedia di lingkungan ini." },
        { status: 503 }
      );
    }

    // Auth check
    if (!(await verifyAdminFromHeader(request))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { key } = await params;
    const content = await db.siteContent.findUnique({ where: { key } });

    if (!content) {
      return NextResponse.json(
        { error: "Konten tidak ditemukan" },
        { status: 404 }
      );
    }

    await db.siteContent.delete({ where: { key } });

    return NextResponse.json({ message: "Konten berhasil dihapus" });
  } catch (error) {
    console.error("Failed to delete content:", error);
    markDbUnavailable();
    return NextResponse.json(
      { error: "Gagal menghapus konten" },
      { status: 500 }
    );
  }
}
