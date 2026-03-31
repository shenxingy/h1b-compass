import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin access from the VPN domain for Turbopack HMR
  // Host binding is set via -H flag in package.json dev script
  allowedDevOrigins: ["h1b-compass.internal.scam.ai"],
};

export default nextConfig;
