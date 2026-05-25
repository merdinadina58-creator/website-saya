import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";

export async function GET() {
  try {
    if (await isDbAvailable()) {
      const record = await db.siteContent.findUnique({
        where: { key: "_logo" },
      });
      if (record) {
        return NextResponse.json(JSON.parse(record.value));
      }
    }
  } catch {
    markDbUnavailable();
  }
  return NextResponse.json({ src: "/logo-512.png" });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check — always verify first (works on Vercel via default credentials)
    if (!(await verifyAdminFromHeader(req))) {
      return NextResponse.json(
        { error: "Tidak memiliki akses. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file size (3MB max)
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file maksimal 3MB. File Anda: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Convert to base64
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const logoData = {
      src: dataUrl,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    };

    // Try to save to database
    let savedToDb = false;
    try {
      if (await isDbAvailable()) {
        await db.siteContent.upsert({
          where: { key: "_logo" },
          update: { value: JSON.stringify(logoData) },
          create: { key: "_logo", value: JSON.stringify(logoData) },
        });
        savedToDb = true;
      }
    } catch {
      markDbUnavailable();
    }

    // Also try to save to public folder (works locally, silently fails on Vercel)
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const PUBLIC_DIR = path.join(process.cwd(), "public");

      await mkdir(PUBLIC_DIR, { recursive: true });

      const ext = file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const logoFilename = `logo-uploaded.${ext}`;
      await writeFile(path.join(PUBLIC_DIR, logoFilename), buffer);

      // Try to generate PWA icons with sharp
      try {
        const sharp = (await import("sharp")).default;
        if (ext !== "svg") {
          await sharp(buffer)
            .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(PUBLIC_DIR, "logo-192.png"));

          await sharp(buffer)
            .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(PUBLIC_DIR, "logo-512.png"));
        }
      } catch {
        // Sharp might fail on some environments, that's OK
      }
    } catch {
      // Writing to public/ might fail on Vercel (read-only), that's OK
    }

    return NextResponse.json({
      success: true,
      logo: logoData,
      savedToDb,
      message: savedToDb
        ? "Logo berhasil diupload"
        : "Logo diperbarui di browser (database tidak tersedia)",
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    markDbUnavailable();
    return NextResponse.json({ error: "Gagal mengupload logo" }, { status: 500 });
  }
}
