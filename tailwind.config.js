import { colors as chatColors } from "./config/theme.js";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // colors
      colors: {
        brand: {
          bg: chatColors.primaryBg,
          sidebar: chatColors.sidebarBg,
          accent: chatColors.accent,
          text: chatColors.textPrimary,
          muted: chatColors.textSecondary,
          input: chatColors.inputBg,
          border: chatColors.border,
        },
      },
      // box shadow
      boxShadow: {
        light: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        dark: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
      },
      // border radius
      borderRadius: {
        light: "0.25rem", // 4px
        medium: "0.5rem", // 8px
        dark: "1rem", // 16px
      },
      // opacity
      opacity: {
        disabled: "0.3",
      },
      // font sizes
      fontSize: {
        tiny: "0.75rem", // 12px
        base: "1rem", // 16px
        big: "1.25rem", // 20px
        giant: "2rem", // 32px
      },
      // media screens
      screens: {
        xs: "400px", // Custom mobile breakpoint (smaller than 'sm')
        sm: "640px", // Tailwind's default 'sm' breakpoint
        md: "768px", // Tailwind's default 'md' breakpoint
        lg: "1024px", // Tailwind's default 'lg' breakpoint
        xl: "1280px", // Tailwind's default 'xl' breakpoint
        "2xl": "1440px", // Tailwind's default '2xl' breakpoint
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
