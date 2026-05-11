/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost:3000'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts']
  },
  images: {
    domains: ['serv.aux-rolplay.com']
  }
};

module.exports = nextConfig;
