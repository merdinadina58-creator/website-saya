import type { Metadata } from "next";
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
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Alex Morgan — Developer Kreatif & Desainer",
    description:
      "Portofolio pribadi Alex Morgan — Developer Kreatif & Desainer yang menciptakan pengalaman digital elegan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
