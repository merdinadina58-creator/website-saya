import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const LOGO_DATA_PATH = path.join(DATA_DIR, "logo.json");
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function GET() {
  try {
    const raw = await readFile(LOGO_DATA_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ src: "/logo-512.png" });
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const username = req.headers.get("x-admin-username");
  const password = req.headers.get("x-admin-password");

  try {
    const credPath = path.join(DATA_DIR, "credentials.json");
    const credRaw = await readFile(credPath, "utf-8");
    const cred = JSON.parse(credRaw);
    if (username !== cred.username || password !== cred.password) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("logo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validate file size
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

    // Ensure directories exist
    await mkdir(DATA_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";

    // Save original logo
    const logoFilename = `logo-uploaded.${ext}`;
    const logoPath = path.join(PUBLIC_DIR, logoFilename);
    await writeFile(logoPath, buffer);

    let logoSrc = `/${logoFilename}`;

    // Generate PWA icons (192x192 and 512x512) from raster images
    if (ext !== "svg") {
      try {
        await sharp(buffer)
          .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(path.join(PUBLIC_DIR, "logo-192.png"));

        await sharp(buffer)
          .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(path.join(PUBLIC_DIR, "logo-512.png"));

        logoSrc = "/logo-512.png";
      } catch (sharpErr) {
        console.error("Sharp resize error:", sharpErr);
        // If sharp fails, still save the original
      }
    } else {
      // For SVG, copy as PWA icons too
      await writeFile(path.join(PUBLIC_DIR, "logo-192.png"), buffer);
      await writeFile(path.join(PUBLIC_DIR, "logo-512.png"), buffer);
    }

    // Save logo metadata
    const logoData = {
      src: logoSrc,
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      size: file.size,
    };
    await writeFile(LOGO_DATA_PATH, JSON.stringify(logoData, null, 2));

    return NextResponse.json({ success: true, logo: logoData });
  } catch (err) {
    console.error("Logo upload error:", err);
    return NextResponse.json({ error: "Gagal mengupload logo" }, { status: 500 });
  }
}
