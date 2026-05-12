import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // sortie autonome pour l'image Docker (`node server.js`)
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Images servies par Wagtail (renditions). Adapter aux hôtes réels en prod.
    remotePatterns: [
      { protocol: "https", hostname: "www.fodecc.cm" },
      { protocol: "https", hostname: "fodecc.cm" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "backend" },
    ],
  },
};

export default withNextIntl(nextConfig);
