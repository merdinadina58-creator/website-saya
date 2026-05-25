import { ContentProvider } from "@/components/ContentProvider";
import { AdminProvider } from "@/components/AdminProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
    <ErrorBoundary>
      <AdminProvider>
        <ContentProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <ErrorBoundary>
                <HeroSection />
              </ErrorBoundary>
              <ErrorBoundary>
                <AboutSection />
              </ErrorBoundary>
              <ErrorBoundary>
                <SkillsSection />
              </ErrorBoundary>
              <ErrorBoundary>
                <PortfolioSection />
              </ErrorBoundary>
              <ErrorBoundary>
                <InformasiSection />
              </ErrorBoundary>
              <ErrorBoundary>
                <ContactSection />
              </ErrorBoundary>
            </main>
            <footer className="mt-auto">
              <ErrorBoundary>
                <FooterSection />
              </ErrorBoundary>
            </footer>
          </div>
        </ContentProvider>
      </AdminProvider>
    </ErrorBoundary>
  );
}
