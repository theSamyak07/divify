/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep @stellar/stellar-sdk server-side only — it uses Node built-ins
  // (crypto, stream, buffer) that cannot be bundled for the browser by Turbopack
  serverExternalPackages: ["@stellar/stellar-sdk"],
}

export default nextConfig
