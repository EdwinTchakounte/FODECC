import type { Config } from "tailwindcss";

/**
 * Design system FODECC — inspiration éditoriale type PAM/WFP : grandes images,
 * typo affirmée, beaucoup de respiration, formes douces (coins très arrondis),
 * ombres légères. Palette ancrée dans l'identité cacao / café.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Brun institutionnel (cacao)
        cacao: {
          50: "#FBF6F0",
          100: "#F4E7D6",
          200: "#E7CDAE",
          300: "#D6AC7C",
          400: "#C2884B",
          500: "#A86A2D",
          600: "#8C5424",
          700: "#6E4020",
          800: "#4E2E18",
          900: "#371F10",
          950: "#211208",
        },
        // Vert feuillage (café) — couleur d'accent
        forest: {
          50: "#EEF7F0",
          100: "#D6ECDB",
          200: "#AEDABA",
          300: "#7DC18F",
          400: "#4DA567",
          500: "#2F8C4B",
          600: "#23713C",
          700: "#1C5A31",
          800: "#174629",
          900: "#123620",
        },
        // Or chaud (cabosse) — surlignages, badges, CTA secondaires
        gold: {
          300: "#F6CE7A",
          400: "#EFB949",
          500: "#E2A126",
          600: "#C0831B",
          700: "#9A6716",
        },
        // Fond crème (off-white tiède)
        cream: "#FBF8F2",
        sand: "#F4EEE3",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        soft: "0 14px 44px -16px rgba(28, 20, 12, 0.22)",
        card: "0 6px 28px -10px rgba(28, 20, 12, 0.14)",
        "card-hover": "0 18px 50px -14px rgba(28, 20, 12, 0.26)",
      },
      maxWidth: {
        prose: "44rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.9s ease-out both",
        bob: "bob 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
