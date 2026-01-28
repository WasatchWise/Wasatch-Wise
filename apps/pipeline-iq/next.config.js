/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: ['rpephxkyyllvikmdnqem.supabase.co'],
  },
}

module.exports = nextConfig
