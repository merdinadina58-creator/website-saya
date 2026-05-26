import { NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { readCloudData, isCloudSyncAvailable } from "@/lib/cloud-store";

export async function GET() {
  let siteName = "Website Saya";
  let shortName = "WebsiteSaya";
  let description = "Portofolio pribadi yang menciptakan pengalaman digital elegan.";

  // 1. Try database first for site name
  try {
    if (await isDbAvailable()) {
      const heroRecord = await db.siteContent.findUnique({
        where: { key: "hero" },
      });
      if (heroRecord) {
        const hero = JSON.parse(heroRecord.value);
        if (hero.name) {
          siteName = hero.title ? `${hero.name} — ${hero.title}` : hero.name;
          shortName = hero.name.split(" ")[0] || "WebsiteSaya";
          description = `Portofolio pribadi ${hero.name} yang menciptakan pengalaman digital elegan.`;
        }
      }
    }
  } catch {
    markDbUnavailable();
  }

  // 2. Try cloud store as fallback
  if (siteName === "Website Saya") {
    try {
      if (isCloudSyncAvailable()) {
        const cloudData = await readCloudData();
        if (cloudData?.content?.hero) {
          const hero = cloudData.content.hero as Record<string, unknown>;
          if (hero.name) {
            siteName = hero.title ? `${hero.name} — ${hero.title}` : (hero.name as string);
            shortName = (hero.name as string).split(" ")[0] || "WebsiteSaya";
            description = `Portofolio pribadi ${hero.name} yang menciptakan pengalaman digital elegan.`;
          }
        }
      }
    } catch {
      // Cloud not available
    }
  }

  // IMPORTANT: Use ONLY static icon files — no API routes!
  // Chrome's WebAPK service fetches icon URLs from Google's servers.
  // API routes (serverless functions) can be slow/unreliable for this,
  // causing Chrome to fall back to a shortcut with badge.
  // Static files are always fast, reliable, and cached by CDN.
  const manifest = {
    id: "/",
    name: siteName,
    short_name: shortName,
    description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#d97706",
    orientation: "portrait-primary",
    icons: [
      { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/logo-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
