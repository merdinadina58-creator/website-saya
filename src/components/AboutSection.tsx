"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { value: "5+", label: "Tahun Pengalaman" },
  { value: "50+", label: "Proyek Selesai" },
  { value: "30+", label: "Klien Puas" },
  { value: "12", label: "Penghargaan" },
];

export default function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 sm:py-28" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Tentang Saya
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Passion Bertemu Tujuan
          </h2>
        </motion.div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto lg:mx-0 max-w-sm"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src="/avatar.png"
                alt="Alex Morgan — Developer Kreatif & Desainer"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-accent/30" />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">
              Seorang developer dengan mata desainer dan passion untuk kode bersih.
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Saya Alex Morgan, seorang developer kreatif dan desainer yang berbasis di
                Jakarta. Dengan pengalaman lebih dari lima tahun, saya spesialisasi
                dalam membangun aplikasi web yang indah dan berkinerja tinggi yang
                menjembatani kesenjangan antara estetika dan fungsionalitas.
              </p>
              <p>
                Perjalanan saya dimulai dari desain grafis, yang memberikan saya
                perspektif unik tentang pengalaman pengguna. Saya percaya bahwa
                perangkat lunak yang hebat tidak hanya harus berfungsi — tetapi juga
                harus memberikan kegembiraan. Setiap proyek yang saya ambil adalah
                kesempatan untuk menciptakan sesuatu yang bermakna dan berkesan.
              </p>
              <p>
                Saat tidak coding, Anda akan menemukan saya menjelajahi tipografi,
                bereksperimen dengan seni generatif, atau mendaki jalur pegunungan
                di Indonesia.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            >
              <Card className="text-center border-border/50 bg-card/50 hover:border-accent/30 transition-colors">
                <CardContent className="pt-6">
                  <p className="text-3xl sm:text-4xl font-bold text-accent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
