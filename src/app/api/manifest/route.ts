import { NextResponse } from "next/server";
import { db, isDbAvailable, markDbUnavailable } from "@/lib/db";

export async function GET() {
  let siteName = "Website Saya";
  let shortName = "WebsiteSaya";
  let description = "Portofolio pribadi yang menciptakan pengalaman digital elegan.";
  let iconSrc = "/logo-192.png";

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
          // Use API route for icon that reads from DB
          iconSrc = "/api/logo-icon?size=192";
        }
      }
    }
  } catch {
    markDbUnavailable();
  }

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
        src: iconSrc.replace("192", "512"),
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
