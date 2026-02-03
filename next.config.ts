/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Good for deployment stability (Vercel or Docker).
  output: "standalone",

  // If you load images from external domains later, add them here.
  images: {
    remotePatterns: [
      // Example:
      // { protocol: "https", hostname: "your-cdn.com" }
    ]
  }
};

export default nextConfig;
