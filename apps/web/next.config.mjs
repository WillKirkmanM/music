import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public"
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  output: "standalone",
  /*
  typescript: {
    ignoreBuildErrors: true
  },

  eslint: {
    ignoreDuringBuilds: true
  }
  */
  async rewrites() {
    return [
      {
        source: '/server/:path*',
        destination: `http://127.0.0.1:${process.env.BACKEND_PORT ?? 3001}/:path*`
      },
      {
        source: '/websocket/:path*',
        destination: `http://127.0.0.1:${process.env.WEBSOCKET_PORT ?? 3002}/:path*`
      }
    ]
  }
});

export default nextConfig;