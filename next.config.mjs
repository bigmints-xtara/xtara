/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  // Custom domain configuration - no base path needed
  // basePath: '', // Empty for custom domain
  // assetPrefix: '', // Empty for custom domain
};

export default nextConfig;
