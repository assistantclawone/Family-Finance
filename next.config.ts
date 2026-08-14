import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* Statischer Export (GitHub Pages) */
  output: 'export',
  basePath: '/Family-Finance',
  trailingSlash: true,
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
