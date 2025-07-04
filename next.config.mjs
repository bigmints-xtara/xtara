/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration for repository subdirectory (production only)
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/xtara',
    assetPrefix: '/xtara/',
  }),
};

export default nextConfig;
