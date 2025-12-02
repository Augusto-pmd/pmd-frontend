import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pmd: {
          blue: "#162F7F",
          darkBlue: "#0f1f3d",
          mediumBlue: "#1f3a68",
          gold: "#d4af37",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        pmd: "4px",
      },
      boxShadow: {
        pmd: "0 2px 8px rgba(0, 0, 0, 0.1)",
        "glass": "0 4px 20px rgba(0, 0, 0, 0.08)",
        "pmd-glow": "0 0 15px rgba(22, 47, 127, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;

