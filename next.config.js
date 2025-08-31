/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Remove output: 'export' for Render deployment
  // Use output: 'export' only for static hosting
}

module.exports = nextConfig