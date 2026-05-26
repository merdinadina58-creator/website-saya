import { NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { readCloudData, isCloudSyncAvailable } from "@/lib/cloud-store";
import { readFile } from "fs/promises";
import { join } from "path";

/** Serve a static icon file from public/ as fallback */
export async function serveStaticIcon(size: number): Promise<NextResponse> {
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
    // Return minimal transparent PNG
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

/** Get logo data URL from DB or cloud store */
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

  // 2. Try cloud store
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

/**
 * Get a properly sized logo image buffer.
 *
 * @param size - Target size in pixels (192 or 512)
 * @param maskable - If true, adds safe area padding (logo in center 80%, solid bg)
 *   Maskable icons are required by Android to prevent Chrome badge overlay.
 */
export async function getLogoImage(size: number, maskable: boolean): Promise<Buffer | null> {
  const dataUrl = await getLogoDataUrl();
  if (!dataUrl) return null;

  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) return null;

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, "base64");

  try {
    const sharp = (await import("sharp")).default;

    if (maskable) {
      // Maskable icon: logo centered at 80% of canvas with solid background
      // This prevents Android from adding a Chrome badge
      const logoSize = Math.round(size * 0.8);
      const padding = Math.round(size * 0.1);

      const resized = await sharp(buffer)
        .resize(logoSize, logoSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      const maskableIcon = await sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: { r: 10, g: 10, b: 10, alpha: 1 },
        },
      })
        .composite([
          {
            input: resized,
            left: padding,
            top: padding,
          },
        ])
        .png()
        .toBuffer();

      return maskableIcon;
    } else {
      // Regular icon: transparent background, full-size logo
      const resized = await sharp(buffer)
        .resize(size, size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      return resized;
    }
  } catch {
    // Sharp not available — return raw buffer (might not be correct size but better than nothing)
    return buffer;
  }
}
