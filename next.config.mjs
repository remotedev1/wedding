/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx"],
  allowedDevOrigins: ["http://localhost:3000"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", port: "" },
      { protocol: "https", hostname: "unsplash.com", port: "" },
      { protocol: "https", hostname: "images.unsplash.com", port: "" },
    ],
  },
  async headers() {
    return [
      {
        source: "/videos/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;