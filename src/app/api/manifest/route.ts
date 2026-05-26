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
      // Get hero content for name
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

      // Get logo for icon
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

  // 2. Try cloud store as fallback (critical for Vercel where DB is ephemeral)
  if (!hasCustomLogo || siteName === "Website Saya") {
    try {
      if (isCloudSyncAvailable()) {
        const cloudData = await readCloudData();
        if (cloudData) {
          // Get hero name from cloud if not found in DB
          if (siteName === "Website Saya" && cloudData.content?.hero) {
            const hero = cloudData.content.hero as Record<string, unknown>;
            if (hero.name) {
              siteName = hero.title ? `${hero.name} — ${hero.title}` : (hero.name as string);
              shortName = (hero.name as string).split(" ")[0] || "WebsiteSaya";
              description = `Portofolio pribadi ${hero.name} yang menciptakan pengalaman digital elegan.`;
            }
          }
          // Check logo in cloud
          if (cloudData.logo?.src?.startsWith("data:")) {
            hasCustomLogo = true;
          }
        }
      }
    } catch {
      // Cloud not available
    }
  }

  // Use API routes for icons (they have cloud fallback too)
  const iconSrc = hasCustomLogo ? "/api/logo-icon?size=192" : "/logo-192.png";
  const iconSrc512 = hasCustomLogo ? "/api/logo-icon?size=512" : "/logo-512.png";

  const manifest = {
    name: siteName,
    short_name: shortName,
    description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#d97706",
    orientation: "portrait-primary",
    icons: [
      {
        src: iconSrc,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: iconSrc512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
