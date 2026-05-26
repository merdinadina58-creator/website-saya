import { NextResponse } from "next/server";
import { getLogoImage, serveStaticIcon } from "@/lib/icon-helpers";

export async function GET() {
  try {
    const imageBuffer = await getLogoImage(192, false);
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
  return serveStaticIcon(192);
}
