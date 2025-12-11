import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    externalDir: true
  },
  transpilePackages: ["@dav033/dav-components"],
};

export default nextConfig;
