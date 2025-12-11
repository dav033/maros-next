import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Desactivar caché de componentes en desarrollo para hot reload
  cacheComponents: !isDev,
  experimental: {
    externalDir: true
  },
  transpilePackages: ["@dav033/dav-components"],
  // Configurar Turbopack para hot reload en desarrollo con paquete local
  turbopack: {
    resolveAlias: isDev ? {
      '@dav033/dav-components': path.resolve(__dirname, '../davComponents/src'),
    } : undefined,
    resolveExtensions: isDev ? [
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ] : undefined,
  },
  // Configurar webpack como fallback (se usará si se especifica --webpack)
  webpack: (config, { dev }) => {
    if (dev) {
      const davComponentsPath = path.resolve(__dirname, '../davComponents');
      const davComponentsSrcPath = path.resolve(davComponentsPath, 'src');
      
      // Resolver el paquete local directamente desde el directorio fuente en desarrollo
      config.resolve.alias = {
        ...config.resolve.alias,
        '@dav033/dav-components': davComponentsSrcPath,
      };
      
      // Configurar watchOptions para observar cambios en el directorio fuente
      const existingIgnored = config.watchOptions?.ignored;
      let watchIgnored: (string | RegExp)[] = [];
      
      if (Array.isArray(existingIgnored)) {
        watchIgnored = existingIgnored;
      } else if (existingIgnored) {
        watchIgnored = [existingIgnored];
      }
      
      // Filtrar solo strings válidos (webpack solo acepta strings en ignored)
      // y excluir los que mencionan davComponents
      const filteredIgnored = watchIgnored
        .filter((pattern): pattern is string => typeof pattern === 'string' && pattern.length > 0)
        .filter((pattern) => !pattern.includes('davComponents') && !pattern.includes('@dav033'));
      
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          ...filteredIgnored,
          '**/node_modules/**',
          `!${davComponentsPath.replace(/\\/g, '/')}/**`, // NO ignorar davComponents (usar / para compatibilidad)
        ],
        poll: 1000, // Polling para detectar cambios en Windows
        aggregateTimeout: 300, // Esperar 300ms después de cambios antes de recompilar
      };
      
      // Excluir davComponents del snapshot para forzar recompilación
      config.snapshot = {
        ...config.snapshot,
        managedPaths: (config.snapshot?.managedPaths || []).filter((p) => {
          if (typeof p === 'string') {
            return !p.includes('davComponents');
          }
          // Mantener otros tipos (RegExp, etc.)
          return true;
        }),
      };
    }
    return config;
  },
};

export default nextConfig;
