import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar source maps en producción para evitar errores
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      const buildVersion = process.env.COMMIT_REF ?? process.env.NETLIFY_COMMIT_REF ?? "local";
      config.output.uniqueName = `maros_next_${buildVersion}`;
    }
    return config;
  },
};

export default nextConfig;
