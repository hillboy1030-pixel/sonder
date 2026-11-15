import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The journal PDF renderer runs on the server with its own fonts.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/api/**": ["./assets/fonts/**"],
  },
};

export default nextConfig;
