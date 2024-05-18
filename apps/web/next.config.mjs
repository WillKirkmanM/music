import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public"
})

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  /*
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true
  },

  eslint: {
    ignoreDuringBuilds: true
  }
  */
});

export default nextConfig;
