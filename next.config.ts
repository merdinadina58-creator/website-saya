import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-fbc9ba61-f598-4fe2-bdc5-a53fa1c5b88a.space-z.ai",
    ".space-z.ai",
  ],
};

export default nextConfig;
