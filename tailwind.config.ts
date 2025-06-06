import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Digital Monastery custom colors
        monastery: {
          primary: "#4c1d95", // Monastic depth
          accent: "#00e6e6", // Refined digital enlightenment (90% of cyan)
          secondary: "#e600e6", // Refined transcendent shock (90% of magenta)
          success: "#72e600", // Refined electric nature (90% of chartreuse)
          warning: "#e63f00", // Refined spiritual fire (90% of orange red)
          danger: "#c61239", // Refined sacred urgency (90% of crimson)
          void: "#000011", // Pure meditation
          surface: "#0d1421", // Contemplative space
          ethereal: "#f8f8ff", // Ethereal clarity
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(76, 29, 149, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(76, 29, 149, 0.6), 0 0 40px rgba(0, 230, 230, 0.2)",
          },
        },
        "cyber-glow": {
          "0%, 100%": {
            textShadow: "0 0 10px rgba(0, 230, 230, 0.5)",
          },
          "50%": {
            textShadow: "0 0 20px rgba(0, 230, 230, 0.8), 0 0 30px rgba(76, 29, 149, 0.4)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "cyber-glow": "cyber-glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "monastery-gradient": "linear-gradient(135deg, #4c1d95 0%, #0d1421 50%, #000011 100%)",
        "cyber-accent": "linear-gradient(135deg, #4c1d95 0%, #00e6e6 100%)",
        transcendent: "linear-gradient(135deg, #e600e6 0%, #4c1d95 100%)",
      },
      boxShadow: {
        monastery: "0 4px 20px rgba(0, 0, 0, 0.5), 0 0 40px rgba(76, 29, 149, 0.1)",
        cyber: "0 0 20px rgba(0, 230, 230, 0.3)",
        transcendent: "0 0 20px rgba(230, 0, 230, 0.3)",
        ethereal: "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(76, 29, 149, 0.2)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
