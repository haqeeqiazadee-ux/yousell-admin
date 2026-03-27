/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      { protocol: 'https', hostname: '*.shopify.com' },
      { protocol: 'https', hostname: '*.pinimg.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  // Server-side env vars (API routes, server components) are available
  // via process.env on Netlify Functions automatically.
  // Do NOT use next.config `env:{}` — it leaks values into the client bundle.
};

export default nextConfig;
