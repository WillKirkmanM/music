/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "http",
        hostname: "coverartarchive.org"
      },
      {
        protocol: "https",
        hostname: "archive.org"
      },
    ]
  },
  /*
  typescript: {
    ignoreBuildErrors: true
  },

  eslint: {
    ignoreDuringBuilds: true
  }
  */
};

export default nextConfig;
