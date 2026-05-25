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
    label: "Location",
    value: "San Francisco, CA",
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
            Contact
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
            Let&apos;s Work Together
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Have a project in mind or just want to say hello? I&apos;d love to
            hear from you. Let&apos;s create something extraordinary.
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
              Get in Touch
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Whether you have a question, a collaboration idea, or just want
              to connect — my inbox is always open. I try to respond within 24
              hours.
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
                Follow Me
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
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
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
                        placeholder="you@example.com"
                        className="border-border/60 focus:border-accent/60 min-h-[44px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="Project inquiry"
                      className="border-border/60 focus:border-accent/60 min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell me about your project..."
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
                    Send Message
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
