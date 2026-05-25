"use client";

import { useEffect, useCallback } from "react";
import { useContent } from "@/components/ContentProvider";

// localStorage key for logo (must match Navbar)
const LOGO_LS_KEY = "website-logo";

function getLogoFromLocalStorage(): { src: string; mimeType?: string } | null {
  try {
    const stored = localStorage.getItem(LOGO_LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Invalid JSON, ignore
  }
  return null;
}

export default function DynamicTitle() {
  const { content } = useContent();

  // Update favicon using base64 data URL from localStorage
  const updateFaviconFromLocalStorage = useCallback(() => {
    const logoData = getLogoFromLocalStorage();
    if (!logoData?.src) return;

    // Update favicon link tags with base64 data URL
    const dynamicFavicon = document.getElementById("dynamic-favicon") as HTMLLinkElement;
    if (dynamicFavicon) {
      dynamicFavicon.href = logoData.src;
    }

    // Also update the static favicon link
    const staticFavicon = document.querySelector('link[rel="icon"][href="/favicon.ico"]') as HTMLLinkElement;
    if (staticFavicon) {
      staticFavicon.href = logoData.src;
    }

    // Update apple touch icon
    const dynamicAppleIcon = document.getElementById("dynamic-apple-icon") as HTMLLinkElement;
    if (dynamicAppleIcon) {
      dynamicAppleIcon.href = logoData.src;
    }

    const staticAppleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (staticAppleIcon) {
      staticAppleIcon.href = logoData.src;
    }
  }, []);

  // Update PWA manifest dynamically with logo from localStorage
  const updateManifestFromLocalStorage = useCallback(() => {
    const logoData = getLogoFromLocalStorage();
    if (!logoData?.src) return;

    // For PWA manifest icons, we can't use data URLs directly in all browsers
    // Instead, create a dynamic manifest using blob URLs
    try {
      const manifest = {
        name: document.title || "Website Saya",
        short_name: "WebsiteSaya",
        description: "Portofolio pribadi — Developer Kreatif & Desainer yang menciptakan pengalaman digital elegan.",
        start_url: "/",
        display: "standalone" as const,
        background_color: "#0a0a0a",
        theme_color: "#d97706",
        orientation: "portrait-primary",
        icons: [
          {
            src: logoData.src,
            sizes: "192x192",
            type: logoData.mimeType || "image/png",
            purpose: "any maskable",
          },
          {
            src: logoData.src,
            sizes: "512x512",
            type: logoData.mimeType || "image/png",
            purpose: "any maskable",
          },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
      const manifestUrl = URL.createObjectURL(blob);

      const existingManifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (existingManifest) {
        existingManifest.href = manifestUrl;
      }
    } catch {
      // Manifest update is non-critical
    }
  }, []);

  // Update page title from hero content
  useEffect(() => {
    const hero = content.hero as { name?: string; title?: string } | undefined;
    if (hero?.name) {
      const title = hero.title
        ? `${hero.name} — ${hero.title}`
        : hero.name;
      document.title = title;

      // Also update Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", title);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute(
          "content",
          `Portofolio pribadi ${hero.name} — ${hero.title || "Developer Kreatif & Desainer"} yang menciptakan pengalaman digital elegan.`
        );
      }
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          `Portofolio pribadi ${hero.name} — ${hero.title || "Developer Kreatif & Desainer"} yang menciptakan pengalaman digital elegan.`
        );
      }
    }
  }, [content.hero]);

  // Update favicon and manifest on mount and when content changes
  useEffect(() => {
    updateFaviconFromLocalStorage();
    updateManifestFromLocalStorage();
  }, [updateFaviconFromLocalStorage, updateManifestFromLocalStorage, content]);

  return null;
}
