import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-fg": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        accent: "hsl(var(--accent))",
        "accent-fg": "hsl(var(--accent-foreground))",
        danger: "hsl(var(--danger))",
        warning: "hsl(var(--warning))",
        success: "hsl(var(--success))",
        primary: "hsl(var(--primary))",
        "primary-fg": "hsl(var(--primary-foreground))",
      },
      borderRadius: { lg: "12px", md: "10px", sm: "8px" },
      boxShadow: {
        soft: "0 4px 24px -4px hsl(220 40% 4% / 0.12)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 8px 40px -12px hsl(var(--primary) / 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
