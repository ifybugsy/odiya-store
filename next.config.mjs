/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    maxHeaderSize: 32768,
  },
  env: {
    MAX_UPLOAD_SIZE: '100mb',
  },
  experimental: {
    turbo: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
