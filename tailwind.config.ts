import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ceres: {
          bg:       "#0a0f1a",
          surface:  "#111827",
          border:   "#1f2d40",
          muted:    "#374151",
          text:     "#e2e8f0",
          subtle:   "#94a3b8",
          accent:   "#3b82f6",
          tier1:    "#ef4444",
          tier2:    "#f97316",
          tier3:    "#eab308",
          safe:     "#22c55e",
          critical: "#dc2626",
          warning:  "#ea580c",
          watch:    "#ca8a04",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
