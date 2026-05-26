"use client";

import { AdminProvider } from "@/components/AdminProvider";
import { ContentProvider } from "@/components/ContentProvider";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import InformasiSection from "@/components/InformasiSection";
import ContactSection from "@/components/ContactSection";
import FooterSection from "@/components/FooterSection";
import AdminToolbar from "@/components/AdminToolbar";
import DynamicTitle from "@/components/DynamicTitle";
import SyncIndicator from "@/components/SyncIndicator";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export default function Home() {
  return (
    <AdminProvider>
      <ContentProvider>
        <DynamicTitle />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <HeroSection />
            <AboutSection />
            <InformasiSection />
            <ContactSection />
          </main>
          <footer className="mt-auto">
            <FooterSection />
          </footer>
          <AdminToolbar />
          <SyncIndicator />
          <PwaInstallPrompt />
        </div>
      </ContentProvider>
    </AdminProvider>
  );
}
