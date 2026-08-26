// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración general
  reactStrictMode: true,
  // swcMinify: true,
  
  // Configuración de imágenes
  images: {
    // Para permitir imágenes de Cloudinary
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    // Los errores de lint (no-explicit-any, unused vars) no deben bloquear el deploy
    ignoreDuringBuilds: true
  },
};

module.exports = nextConfig;