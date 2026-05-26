import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#d97706",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Alex Morgan — Developer Kreatif & Desainer",
  description:
    "Portofolio pribadi Alex Morgan — Developer Kreatif & Desainer yang menciptakan pengalaman digital elegan.",
  keywords: [
    "Alex Morgan",
    "Developer Kreatif",
    "Desainer",
    "Portofolio",
    "Pengembangan Web",
    "UI/UX",
  ],
  authors: [{ name: "Alex Morgan" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/api/favicon", sizes: "32x32", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/logo-512.png",
  },
  manifest: "/api/manifest",
  openGraph: {
    title: "Alex Morgan — Developer Kreatif & Desainer",
    description:
      "Portofolio pribadi Alex Morgan — Developer Kreatif & Desainer yang menciptakan pengalaman digital elegan.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Website Saya",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/api/favicon" sizes="32x32" type="image/png" id="dynamic-favicon" />
        <link rel="apple-touch-icon" href="/api/logo-icon?size=512" id="dynamic-apple-icon" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Fallback for when JavaScript is completely disabled.
            framer-motion sets inline style="opacity:0" on animated elements;
            without JS they stay invisible forever. This immediately makes
            all such elements visible. */}
        <noscript>
          <style>{`
            [style*="opacity: 0"], [style*="opacity:0"] {
              opacity: 1 !important;
              transform: none !important;
            }
          `}</style>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        {/* PWA Service Worker Registration — only in production */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    // Force update to latest SW
                    reg.update();
                  }).catch(function() {});
                });
              }
            `,
          }}
        />
        {/* Global handler: open external links in system browser (fixes PWA standalone back-button issue) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('click', function(e) {
                var link = e.target.closest('a');
                if (!link) return;
                var href = link.getAttribute('href') || '';
                // Skip anchor links, empty links, and same-origin links
                if (!href || href.startsWith('#') || href.startsWith('/')) return;
                // Only handle http/https links (external URLs)
                if (href.startsWith('http://') || href.startsWith('https://')) {
                  // Check if it's a same-origin link
                  try {
                    var url = new URL(href);
                    if (url.origin === window.location.origin) return;
                  } catch(ex) {}
                  // Open in system browser instead of PWA window
                  link.setAttribute('target', '_blank');
                  link.setAttribute('rel', 'noopener noreferrer');
                }
                // Also handle mailto: and tel: links
                if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                  link.setAttribute('target', '_blank');
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
