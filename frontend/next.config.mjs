import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // sortie autonome (utile pour une image Docker ; ignorée par Vercel)
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Images / vidéos servies par Wagtail (renditions) ou par l'ancien site.
    remotePatterns: [
      { protocol: "https", hostname: "backend.fodecc-vitrine.horus-lab.com" },
      { protocol: "https", hostname: "fodecc-vitrine.horus-lab.com" },
      { protocol: "https", hostname: "www.fodecc.cm" },
      { protocol: "https", hostname: "fodecc.cm" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "backend" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default withNextIntl(nextConfig);
