"use client";

import { AdminProvider } from "@/components/AdminProvider";
import { ContentProvider } from "@/components/ContentProvider";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import SkillsSection from "@/components/SkillsSection";
import PortfolioSection from "@/components/PortfolioSection";
import InformasiSection from "@/components/InformasiSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";

export default function Home() {
  return (
    <AdminProvider>
      <ContentProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <PortfolioSection />
            <InformasiSection />
            <ContactSection />
          </main>
          <footer className="mt-auto">
            <FooterSection />
          </footer>
        </div>
      </ContentProvider>
    </AdminProvider>
  );
}
