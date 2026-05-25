import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const contents = await db.siteContent.findMany();
    const result: Record<string, unknown> = {};
    for (const item of contents) {
      try {
        result[item.key] = JSON.parse(item.value);
      } catch {
        result[item.key] = item.value;
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return NextResponse.json(
      { error: "Gagal mengambil konten" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key dan value wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await db.siteContent.findUnique({ where: { key } });
    if (existing) {
      return NextResponse.json(
        { error: "Key sudah ada" },
        { status: 409 }
      );
    }

    const content = await db.siteContent.create({
      data: {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
    });

    return NextResponse.json(
      { key: content.key, value: JSON.parse(content.value) },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create content:", error);
    return NextResponse.json(
      { error: "Gagal membuat konten" },
      { status: 500 }
    );
  }
}
