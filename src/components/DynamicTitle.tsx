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

/**
 * Force-update the browser favicon by removing ALL existing favicon links
 * and creating fresh ones. Browsers aggressively cache favicons, so simply
 * changing the href attribute often doesn't work.
 */
function forceUpdateFavicon(dataUrl: string) {
  // Remove ALL existing favicon/icon link elements
  const existingIcons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
  existingIcons.forEach((el) => el.remove());

  // Remove existing apple-touch-icon links
  const existingApple = document.querySelectorAll('link[rel="apple-touch-icon"]');
  existingApple.forEach((el) => el.remove());

  // Create new favicon link with the data URL
  const newIcon = document.createElement("link");
  newIcon.rel = "icon";
  newIcon.type = "image/png";
  newIcon.href = dataUrl;
  newIcon.id = "dynamic-favicon";
  document.head.appendChild(newIcon);

  // Also add a shortcut icon for older browsers
  const shortcutIcon = document.createElement("link");
  shortcutIcon.rel = "shortcut icon";
  shortcutIcon.type = "image/png";
  shortcutIcon.href = dataUrl;
  document.head.appendChild(shortcutIcon);

  // Create new apple-touch-icon
  const newApple = document.createElement("link");
  newApple.rel = "apple-touch-icon";
  newApple.href = dataUrl;
  newApple.id = "dynamic-apple-icon";
  document.head.appendChild(newApple);
}

export default function DynamicTitle() {
  const { content } = useContent();

  // Update favicon using base64 data URL from localStorage
  const updateFaviconFromLocalStorage = useCallback(() => {
    const logoData = getLogoFromLocalStorage();
    if (!logoData?.src) return;
    forceUpdateFavicon(logoData.src);
  }, []);

  // Update PWA manifest dynamically with logo from localStorage
  const updateManifestFromLocalStorage = useCallback(() => {
    const logoData = getLogoFromLocalStorage();
    if (!logoData?.src) return;

    try {
      const hero = content.hero as { name?: string; title?: string } | undefined;
      const siteName = hero?.name || "Website Saya";

      const manifest = {
        name: siteName,
        short_name: siteName.split(" ")[0] || "WebsiteSaya",
        description: `Portofolio pribadi ${siteName} yang menciptakan pengalaman digital elegan.`,
        start_url: "/",
        display: "standalone",
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
      } else {
        const newManifest = document.createElement("link");
        newManifest.rel = "manifest";
        newManifest.href = manifestUrl;
        document.head.appendChild(newManifest);
      }
    } catch {
      // Manifest update is non-critical
    }
  }, [content.hero]);

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

  // Update favicon and manifest on mount
  useEffect(() => {
    updateFaviconFromLocalStorage();
    updateManifestFromLocalStorage();
  }, [updateFaviconFromLocalStorage, updateManifestFromLocalStorage]);

  return null;
}
