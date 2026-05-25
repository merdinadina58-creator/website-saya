import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: "Gagal mengambil konten" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: "Gagal memperbarui konten" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
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
    return NextResponse.json(
      { error: "Gagal menghapus konten" },
      { status: 500 }
    );
  }
}
