"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  darkGradient: string;
}

const projects: Project[] = [
  {
    title: "Lumina Dashboard",
    description:
      "Dashboard analitik real-time dengan visualisasi data interaktif dan dukungan mode gelap.",
    tags: ["React", "D3.js", "TypeScript"],
    gradient: "from-amber-400/80 to-orange-500/80",
    darkGradient: "dark:from-amber-600/40 dark:to-orange-700/40",
  },
  {
    title: "Verdant Store",
    description:
      "Platform e-commerce dengan alur checkout yang mulus dan katalog produk responsif.",
    tags: ["Next.js", "Stripe", "Prisma"],
    gradient: "from-emerald-400/80 to-teal-500/80",
    darkGradient: "dark:from-emerald-600/40 dark:to-teal-700/40",
  },
  {
    title: "Synthwave Player",
    description:
      "UI streaming musik dengan visualisasi gelombang suara dan manajemen playlist.",
    tags: ["Vue.js", "Web Audio", "Tailwind"],
    gradient: "from-rose-400/80 to-pink-500/80",
    darkGradient: "dark:from-rose-600/40 dark:to-pink-700/40",
  },
  {
    title: "Atlas Maps",
    description:
      "Aplikasi pemetaan interaktif dengan penanda kustom dan optimasi rute.",
    tags: ["React", "Mapbox", "Node.js"],
    gradient: "from-sky-400/80 to-cyan-500/80",
    darkGradient: "dark:from-sky-600/40 dark:to-cyan-700/40",
  },
  {
    title: "Noctis Blog",
    description:
      "Platform blog minimalis dengan pengeditan markdown dan optimasi SEO.",
    tags: ["Next.js", "MDX", "Vercel"],
    gradient: "from-violet-400/80 to-purple-500/80",
    darkGradient: "dark:from-violet-600/40 dark:to-purple-700/40",
  },
  {
    title: "Forge CMS",
    description:
      "Sistem manajemen konten headless dengan pembangun halaman seret dan lepas.",
    tags: ["TypeScript", "GraphQL", "React"],
    gradient: "from-yellow-400/80 to-amber-500/80",
    darkGradient: "dark:from-yellow-600/40 dark:to-amber-700/40",
  },
];

export default function PortfolioSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="portfolio" className="py-20 sm:py-28" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Portofolio
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Proyek Pilihan
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Pilihan kurasi proyek yang menampilkan kemampuan saya dalam desain,
            pengembangan, dan pemecahan masalah.
          </p>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
            >
              <Card className="group h-full overflow-hidden border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5">
                {/* Gradient Image Placeholder */}
                <div
                  className={`h-48 bg-gradient-to-br ${project.gradient} ${project.darkGradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 size-12 rounded-lg border-2 border-white/40" />
                    <div className="absolute bottom-4 right-4 size-8 rounded-full border-2 border-white/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 rounded-xl border border-white/20" />
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-accent transition-colors">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs hover:bg-accent/20 hover:text-accent transition-colors cursor-default"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="gap-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:text-accent min-h-[36px] cursor-pointer"
                  >
                    <Github className="size-3.5 mr-1" />
                    Kode
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs hover:text-accent min-h-[36px] cursor-pointer"
                  >
                    <ExternalLink className="size-3.5 mr-1" />
                    Demo
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
