import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders() },
    ];
  },
};

export default nextConfig;
