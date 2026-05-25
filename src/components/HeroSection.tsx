"use client";

import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const handleScrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-30"
        style={{ backgroundImage: "url(/hero-bg.png)" }}
      />
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent"
        >
          <Sparkles className="size-4" />
          Tersedia untuk proyek freelance
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground"
        >
          Alex{" "}
          <span className="text-accent">Morgan</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-4 text-lg sm:text-xl md:text-2xl font-light text-muted-foreground"
        >
          Developer Kreatif & Desainer
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
          className="mx-auto mt-6 max-w-2xl text-sm sm:text-base text-muted-foreground/80 leading-relaxed"
        >
          Menciptakan pengalaman digital yang elegan di mana desain bertemu teknologi.
          Saya membangun aplikasi web yang indah, cepat, dan aksesibel yang
          meninggalkan kesan mendalam.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={() => handleScrollTo("#portfolio")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg cursor-pointer min-h-[44px] px-8"
          >
            Lihat Karya Saya
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleScrollTo("#contact")}
            className="border-accent/40 text-accent hover:bg-accent/10 min-h-[44px] px-8 cursor-pointer"
          >
            Hubungi Saya
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-xs tracking-widest uppercase">Gulir</span>
          <ArrowDown className="size-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
