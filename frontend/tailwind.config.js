/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          light: "rgb(var(--paper-light) / <alpha-value>)",
          bright: "rgb(var(--paper-bright) / <alpha-value>)",
        },
        apricot: {
          DEFAULT: "rgb(var(--apricot) / <alpha-value>)",
          light: "rgb(var(--apricot-light) / <alpha-value>)",
          deep: "rgb(var(--apricot-deep) / <alpha-value>)",
        },
        cocoa: {
          DEFAULT: "rgb(var(--cocoa) / <alpha-value>)",
          deep: "rgb(var(--cocoa-deep) / <alpha-value>)",
          soft: "rgb(var(--cocoa-soft) / <alpha-value>)",
        },
        navy: {
          DEFAULT: "rgb(var(--navy) / <alpha-value>)",
          light: "rgb(var(--navy-light) / <alpha-value>)",
          soft: "rgb(var(--navy-soft) / <alpha-value>)",
        },
        ink: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          onDark: "rgb(var(--ink-on-dark) / <alpha-value>)",
          onDarkMuted: "rgb(var(--ink-on-dark-muted) / <alpha-value>)",
        },
        rule: "rgb(var(--rule) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
      },
      borderRadius: { card: "14px", pill: "999px" },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Karla", "system-ui", "sans-serif"],
      },
      letterSpacing: { label: "0.14em" },
      boxShadow: {
        soft: "0 2px 10px rgba(61, 36, 30, 0.07)",
        lift: "0 12px 32px rgba(42, 50, 68, 0.16)",
      },
    },
  },
  plugins: [],
};