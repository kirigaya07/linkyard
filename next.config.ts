import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/boards/board/:token",
        destination: "/board/:token",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
