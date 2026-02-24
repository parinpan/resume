import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
