import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Vercel-Deployment: keine basePath, keine static-export-Einschränkung */
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
