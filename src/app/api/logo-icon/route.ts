import { NextRequest, NextResponse } from "next/server";
import { getLogoImage, serveStaticIcon } from "@/lib/icon-helpers";

export async function GET(req: NextRequest) {
  const size = parseInt(req.nextUrl.searchParams.get("size") || "192") || 192;
  const maskable = req.nextUrl.searchParams.get("maskable") === "true";

  try {
    const imageBuffer = await getLogoImage(size, maskable);
    if (imageBuffer) {
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  } catch {
    // Fall through to static
  }
  return serveStaticIcon(size);
}
