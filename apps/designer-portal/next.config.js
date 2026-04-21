/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: ui-shared ships TypeScript source (.tsx), not compiled JS.
  // Next.js compiles it inline as part of the portal build.
  transpilePackages: ["@repo/ui-shared"],
};

module.exports = nextConfig;
