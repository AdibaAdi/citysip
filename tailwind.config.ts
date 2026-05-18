import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0C",
          900: "#0D0D0F",
          800: "#18181B",
          700: "#1F1F23",
          600: "#2A2A30",
          500: "#3A3A42",
          400: "#56565F",
          300: "#8B8B94",
          200: "#C5C5CB"
        },
        ember: {
          50:  "#FFF7ED",
          100: "#FFEAD0",
          200: "#FFD299",
          300: "#FFB562",
          400: "#FF9A33",
          500: "#FF7A1A",
          600: "#E0620A",
          700: "#B24A07",
          800: "#7E3408",
          900: "#4A1F06"
        },
        amber2: { DEFAULT: "#FFC15E" },
        coral: {
          100: "#FFE0DC",
          200: "#FFC1B8",
          300: "#FF9B8E",
          400: "#FF7363",
          500: "#FF4D3D",
          600: "#E13322",
          700: "#B2271A",
          800: "#7E1B12",
          900: "#4A0F0A",
          DEFAULT: "#FF4D3D"
        },
        cream: { DEFAULT: "#FFF7ED" }
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"]
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E\")",
        "ember-glow": "radial-gradient(60% 50% at 50% 0%, rgba(255,122,26,0.25) 0%, rgba(255,122,26,0) 70%)",
        "ember-spot": "radial-gradient(40% 40% at 80% 20%, rgba(255,77,61,0.20) 0%, rgba(255,122,26,0) 70%)"
      },
      boxShadow: {
        "ember": "0 10px 40px -10px rgba(255,122,26,0.45), 0 4px 18px -8px rgba(255,77,61,0.35)",
        "card": "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 8px 30px -12px rgba(0,0,0,0.6)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
