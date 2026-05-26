import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { readCloudData, isCloudSyncAvailable } from "@/lib/cloud-store";
import { readFile } from "fs/promises";
import { join } from "path";

async function serveStaticLogo(size: number) {
  try {
    const filename = size <= 192 ? "logo-192.png" : "logo-512.png";
    const filePath = join(process.cwd(), "public", filename);
    const buffer = await readFile(filePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    // If even the static file fails, return a minimal transparent PNG
    const minimalPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    return new NextResponse(new Uint8Array(minimalPng), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  }
}

/** Get logo data URL from DB or cloud store (fallback for Vercel where DB is ephemeral) */
async function getLogoDataUrl(): Promise<string | null> {
  // 1. Try database first
  try {
    if (await isDbAvailable()) {
      const record = await db.siteContent.findUnique({
        where: { key: "_logo" },
      });
      if (record) {
        const logoData = JSON.parse(record.value);
        if (logoData.src?.startsWith("data:")) return logoData.src;
      }
    }
  } catch {
    markDbUnavailable();
  }

  // 2. Try cloud store (persists across Vercel redeployments)
  try {
    if (isCloudSyncAvailable()) {
      const cloudData = await readCloudData();
      if (cloudData?.logo?.src?.startsWith("data:")) {
        return cloudData.logo.src;
      }
    }
  } catch {
    // Cloud not available
  }

  return null;
}

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get("size") || "192") || 192;

  try {
    const dataUrl = await getLogoDataUrl();

    if (!dataUrl) {
      return await serveStaticLogo(size);
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return await serveStaticLogo(size);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Try to resize using sharp
    try {
      const sharp = (await import("sharp")).default;
      const resized = await sharp(buffer)
        .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      return new NextResponse(new Uint8Array(resized), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      // Sharp not available — return the raw image
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {
    return await serveStaticLogo(size);
  }
}
