"use client";

import { useEffect } from "react";
import { useContent } from "@/components/ContentProvider";

export default function DynamicTitle() {
  const { content } = useContent();

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

  return null;
}
