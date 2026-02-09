/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  reactStrictMode: true,

  // Good for deployment stability (Vercel or Docker).
  output: "standalone",

  // Fix Next.js choosing the wrong workspace root when multiple lockfiles exist.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#caveats
  outputFileTracingRoot: __dirname,

  // If you load images from external domains later, add them here.
  images: {
    remotePatterns: [
      // Example:
      // { protocol: "https", hostname: "your-cdn.com" }
    ]
  }
};

export default nextConfig;
