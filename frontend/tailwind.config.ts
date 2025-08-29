import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        sei: {
          "300": "#c23b34",
          "400": "#9d1f19",
        },
        dark: {
          "50": "#F9FAFB",
          "100": "#F3F4F6",
          "200": "#E5E7EB",
          "300": "#D1D5DB",
          "400": "#9CA3AF",
          "500": "#6B7280",
          "600": "#4B5563",
          "700": "#374151",
          "800": "#1F2937",
          "900": "#111827",
          "950": "#030712",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        arimo: ["Arimo", "sans-serif"],
        "work-sans": ["Work Sans", "sans-serif"],
        "space-grotesk": ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle at 49.4% 50%, var(--tw-gradient-stops))",
        "sei-gradient":
          "linear-gradient(135deg, #030712 0%, #111827 25%, #1F2937 50%, #374151 100%)",
        "sei-radial":
          "radial-gradient(ellipse at center, rgba(45,145,120,0.15) 0%, rgba(45,145,120,0.05) 40%, rgba(3,7,18,0.8) 100%)",
        "sei-overlay": "linear-gradient(180deg, rgba(3,7,18,0.8) 0%, rgba(17,24,39,0.9) 100%)",
        "animated-gradient-1":
          "linear-gradient(45deg, rgba(45,145,120,0.1), rgba(45,145,120,0.05), rgba(45,145,120,0.02))",
        "animated-gradient-2":
          "linear-gradient(-45deg, rgba(45,145,120,0.08), rgba(45,145,120,0.03), rgba(45,145,120,0.01))",
        "animated-gradient-3":
          "radial-gradient(circle at 30% 70%, rgba(45,145,120,0.06), transparent 50%)",
      },
      animation: {
        "float-slow": "float-slow 15s ease-in-out infinite",
        "float-slower": "float-slower 20s ease-in-out infinite",
        "float-gentle": "float-gentle 18s ease-in-out infinite",
        "float-smooth": "float-smooth 22s ease-in-out infinite",
        "float-dreamy": "float-dreamy 25s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 10s linear infinite",
        "gradient-pulse": "gradient-pulse 8s ease-in-out infinite",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": {
            transform: "translate(0px, 0px) rotate(0deg) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -30px) rotate(120deg) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) rotate(240deg) scale(0.9)",
          },
        },
        "float-slower": {
          "0%, 100%": {
            transform: "translate(0px, 0px) rotate(0deg) scale(1)",
          },
          "50%": {
            transform: "translate(-40px, -20px) rotate(180deg) scale(1.2)",
          },
        },
        "gradient-shift": {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(100vw)",
          },
        },
        "gradient-pulse": {
          "0%, 100%": {
            opacity: "0.4",
          },
          "50%": {
            opacity: "0.1",
          },
        },
        "bounce-slow": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  keyframes: {
    shimmer: {
      "100%": {
        transform: "translateX(100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
