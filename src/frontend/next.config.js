const path = require("path");

function normalizeUrl(value) {
  if (!value) return "http://127.0.0.1:8000";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

const backendUrl = normalizeUrl(process.env.BACKEND_URL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
