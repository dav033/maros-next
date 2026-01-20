import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deshabilitar source maps en producción para evitar errores
  productionBrowserSourceMaps: false,
};

export default nextConfig;
