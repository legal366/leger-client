/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12181B",
        canvas: "#F6F5F1",
        panel: "#FFFFFF",
        teal: {
          DEFAULT: "#0F6B5C",
          dark: "#0A4E43",
          light: "#E4F0EC",
        },
        gold: {
          DEFAULT: "#B8912F",
          light: "#F4ECD8",
        },
        slate: {
          muted: "#6B7280",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
