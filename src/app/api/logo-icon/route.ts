import { NextRequest, NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";

function getDefaultUrl(size: number) {
  const defaultPath = size <= 192 ? "/logo-192.png" : "/logo-512.png";
  return new URL(defaultPath, "http://localhost");
}

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get("size") || "192") || 192;

  try {
    if (!(await isDbAvailable())) {
      return NextResponse.redirect(getDefaultUrl(size));
    }

    const record = await db.siteContent.findUnique({
      where: { key: "_logo" },
    });

    if (!record) {
      return NextResponse.redirect(getDefaultUrl(size));
    }

    const logoData = JSON.parse(record.value);
    const dataUrl: string = logoData.src || "";

    if (!dataUrl.startsWith("data:")) {
      return NextResponse.redirect(getDefaultUrl(size));
    }

    // Parse base64 data URL
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.redirect(getDefaultUrl(size));
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
    markDbUnavailable();
    return NextResponse.redirect(getDefaultUrl(size));
  }
}
