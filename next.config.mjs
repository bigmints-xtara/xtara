/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration for repository subdirectory
  basePath: '/xtara',
  assetPrefix: '/xtara/',
};

export default nextConfig;
