import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/children",
        destination: "/parent",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
