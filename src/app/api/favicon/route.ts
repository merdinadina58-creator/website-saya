import { NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";

const FALLBACK_URL = new URL("/favicon.ico", "http://localhost");

export async function GET() {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    const record = await db.siteContent.findUnique({
      where: { key: "_logo" },
    });

    if (!record) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    const logoData = JSON.parse(record.value);
    const dataUrl: string = logoData.src || "";

    if (!dataUrl.startsWith("data:")) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.redirect(FALLBACK_URL);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Try to resize to 32x32 for favicon using sharp
    try {
      const sharp = (await import("sharp")).default;
      const resized = await sharp(buffer)
        .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
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
    markDbUnavailable();
    return NextResponse.redirect(FALLBACK_URL);
  }
}
