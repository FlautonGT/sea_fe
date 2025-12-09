/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nos.jkt-1.neo.id",
        pathname: "/gate/**",
      },
      {
        protocol: "https",
        hostname: "api.seaply.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.seaply.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gate.nos.jkt-1.neo.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

