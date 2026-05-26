import { NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";
import { readCloudData, isCloudSyncAvailable } from "@/lib/cloud-store";

export async function GET() {
  let siteName = "Website Saya";
  let shortName = "WebsiteSaya";
  let description = "Portofolio pribadi yang menciptakan pengalaman digital elegan.";
  let hasCustomLogo = false;

  // 1. Try database first
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

      const logoRecord = await db.siteContent.findUnique({
        where: { key: "_logo" },
      });
      if (logoRecord) {
        const logoData = JSON.parse(logoRecord.value);
        if (logoData.src && logoData.src.startsWith("data:")) {
          hasCustomLogo = true;
        }
      }
    }
  } catch {
    markDbUnavailable();
  }

  // 2. Try cloud store as fallback
  if (!hasCustomLogo || siteName === "Website Saya") {
    try {
      if (isCloudSyncAvailable()) {
        const cloudData = await readCloudData();
        if (cloudData) {
          if (siteName === "Website Saya" && cloudData.content?.hero) {
            const hero = cloudData.content.hero as Record<string, unknown>;
            if (hero.name) {
              siteName = hero.title ? `${hero.name} — ${hero.title}` : (hero.name as string);
              shortName = (hero.name as string).split(" ")[0] || "WebsiteSaya";
              description = `Portofolio pribadi ${hero.name} yang menciptakan pengalaman digital elegan.`;
            }
          }
          if (cloudData.logo?.src?.startsWith("data:")) {
            hasCustomLogo = true;
          }
        }
      }
    } catch {
      // Cloud not available
    }
  }

  // Clean icon paths + separate any/maskable purposes
  const icons = hasCustomLogo
    ? [
        { src: "/api/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/api/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/api/icon-192-maskable", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/api/icon-512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/logo-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/logo-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  const manifest = {
    // 'id' is required by Chrome 96+ for proper PWA identity and installability
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
    icons,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
