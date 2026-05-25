"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Github, Linkedin, Twitter, Send } from "lucide-react";

const contactInfo = [
  {
    icon: <Mail className="size-5" />,
    label: "Email",
    value: "alex@morgan.dev",
    href: "mailto:alex@morgan.dev",
  },
  {
    icon: <MapPin className="size-5" />,
    label: "Lokasi",
    value: "Jakarta, Indonesia",
    href: undefined,
  },
];

const socialLinks = [
  {
    icon: <Github className="size-5" />,
    label: "GitHub",
    href: "#",
  },
  {
    icon: <Linkedin className="size-5" />,
    label: "LinkedIn",
    href: "#",
  },
  {
    icon: <Twitter className="size-5" />,
    label: "Twitter",
    href: "#",
  },
];

export default function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-20 sm:py-28 bg-muted/30" ref={ref}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Kontak
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Mari Berkolaborasi
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Punya proyek di pikiran atau sekadar ingin menyapa? Saya akan senang
            mendengar dari Anda. Mari ciptakan sesuatu yang luar biasa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Hubungi Saya
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Baik Anda punya pertanyaan, ide kolaborasi, atau sekadar ingin
              terhubung — kotak masuk saya selalu terbuka. Saya berusaha merespons
              dalam 24 jam.
            </p>

            <div className="space-y-4 mb-8">
              {contactInfo.map((info) => (
                <div key={info.label} className="flex items-center gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {info.label}
                    </p>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">
                        {info.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div>
              <p className="text-sm font-medium text-foreground mb-4">
                Ikuti Saya
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex size-11 items-center justify-center rounded-lg border border-border hover:border-accent/40 text-muted-foreground hover:text-accent transition-all duration-300 hover:shadow-md hover:shadow-accent/5"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-medium text-foreground"
                      >
                        Nama
                      </label>
                      <Input
                        id="name"
                        placeholder="Nama Anda"
                        className="border-border/60 focus:border-accent/60 min-h-[44px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="anda@contoh.com"
                        className="border-border/60 focus:border-accent/60 min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Subjek
                    </label>
                    <Input
                      id="subject"
                      placeholder="Pertanyaan proyek"
                      className="border-border/60 focus:border-accent/60 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Pesan
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Ceritakan tentang proyek Anda..."
                      rows={5}
                      className="border-border/60 focus:border-accent/60 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg min-h-[44px] cursor-pointer"
                  >
                    <Send className="size-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
