import type { Config } from "tailwindcss";

// Palette de départ inspirée de l'identité cacao/café du FODECC — à affiner
// pendant la phase de design (DA).
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cacao: {
          50: "#faf5f0",
          100: "#f0e2d3",
          300: "#cda77f",
          500: "#a3743f",
          700: "#6f4a22",
          900: "#3d2812",
        },
        cafe: {
          500: "#2e7d32",
          700: "#1b5e20",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
