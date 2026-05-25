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
      { url: "/api/favicon", sizes: "32x32", type: "image/png" },
      { url: "/api/logo-icon?size=192", sizes: "192x192", type: "image/png" },
    ],
    apple: "/api/logo-icon?size=512",
  },
  manifest: "/manifest.json",
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
        <link rel="icon" href="/api/favicon" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/api/logo-icon?size=512" />
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
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
