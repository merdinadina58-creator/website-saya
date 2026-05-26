import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { verifyAdminFromHeader } from "@/lib/auth";
import { readCloudData, writeCloudData, isCloudSyncAvailable, pushStaticFileToGitHub } from "@/lib/cloud-store";

export async function GET() {
  // 1. Try database first
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

  // 2. Try cloud store as fallback
  try {
    if (isCloudSyncAvailable()) {
      const cloudData = await readCloudData();
      if (cloudData?.logo?.src) {
        return NextResponse.json(cloudData.logo);
      }
    }
  } catch {
    // Cloud not available
  }

  return NextResponse.json({ src: "/logo-512.png" });
}

export async function POST(req: NextRequest) {
  try {
    // Auth check
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

    // Push to cloud immediately
    let savedToCloud = false;
    try {
      if (isCloudSyncAvailable()) {
        const cloudData = await readCloudData();
        await writeCloudData({
          content: cloudData?.content || {},
          credentials: cloudData?.credentials,
          logo: logoData,
          aboutPhoto: cloudData?.aboutPhoto,
          heroBg: cloudData?.heroBg,
          updatedAt: new Date().toISOString(),
        });
        savedToCloud = true;
      }
    } catch {
      // Cloud save failed — that's OK
    }

    // Push static icon files to GitHub repo
    // This is CRITICAL for PWA — Chrome needs static files for WebAPK creation
    // Static files are always fast and reliable, unlike serverless API routes
    let pushedStaticIcons = false;
    try {
      if (isCloudSyncAvailable() && file.type !== "image/svg+xml") {
        const sharp = (await import("sharp")).default;

        // Generate regular icons (transparent background)
        const icon192 = await sharp(buffer)
          .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();

        const icon512 = await sharp(buffer)
          .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();

        // Generate maskable icons (logo centered at 80%, solid dark background)
        const logoSize192 = Math.round(192 * 0.8);
        const padding192 = Math.round(192 * 0.1);
        const resized192 = await sharp(buffer)
          .resize(logoSize192, logoSize192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        const maskable192 = await sharp({
          create: { width: 192, height: 192, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } },
        })
          .composite([{ input: resized192, left: padding192, top: padding192 }])
          .png()
          .toBuffer();

        const logoSize512 = Math.round(512 * 0.8);
        const padding512 = Math.round(512 * 0.1);
        const resized512 = await sharp(buffer)
          .resize(logoSize512, logoSize512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
        const maskable512 = await sharp({
          create: { width: 512, height: 512, channels: 4, background: { r: 10, g: 10, b: 10, alpha: 1 } },
        })
          .composite([{ input: resized512, left: padding512, top: padding512 }])
          .png()
          .toBuffer();

        // Push all 4 icon files to GitHub
        const results = await Promise.allSettled([
          pushStaticFileToGitHub("public/logo-192.png", icon192, "chore: update PWA icon 192px"),
          pushStaticFileToGitHub("public/logo-512.png", icon512, "chore: update PWA icon 512px"),
          pushStaticFileToGitHub("public/logo-192-maskable.png", maskable192, "chore: update PWA maskable icon 192px"),
          pushStaticFileToGitHub("public/logo-512-maskable.png", maskable512, "chore: update PWA maskable icon 512px"),
        ]);

        pushedStaticIcons = results.some(r => r.status === "fulfilled" && r.value === true);
      }
    } catch {
      // Sharp or GitHub push failed — icons still available via API route
    }

    return NextResponse.json({
      success: true,
      logo: logoData,
      savedToDb,
      savedToCloud,
      pushedStaticIcons,
      message: pushedStaticIcons
        ? "Logo berhasil diupload dan ikon PWA diperbarui (rebuild otomatis)"
        : savedToDb
          ? "Logo berhasil diupload"
          : savedToCloud
            ? "Logo disimpan ke cloud"
            : "Logo diperbarui di browser (database dan cloud tidak tersedia)",
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    markDbUnavailable();
    return NextResponse.json({ error: "Gagal mengupload logo" }, { status: 500 });
  }
}
