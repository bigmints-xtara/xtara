/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
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
