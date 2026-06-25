import type { NextConfig } from "next";
const path = require("path");
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["date-fns/esm"] = path.resolve(
      __dirname,
      "node_modules/date-fns",
    );
    return config;
  },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "backend.simplymot.co.uk",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4080",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "backend.simplymot.co.uk",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
