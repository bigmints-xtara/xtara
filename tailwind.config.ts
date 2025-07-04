import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'merriweather': ['Merriweather', 'serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",

        "primary-accent": "var(--primary-accent)",
        "foreground-accent": "var(--foreground-accent)",
        "hero-background": "var(--hero-background)",
        
        // New color palette
        "ocean-navy": "#003763",
        "sky-blue": "#61B3E4",
        "coral-orange": "#EF7521",
        "sun-gold": "#F6B333",
        "ivory-white": "#FFFFFF",
        "seafoam-teal": "#3CA6A6",
        "cream-sand": "#F2E3D5",
        
        // Additional theme colors
        surface: "var(--surface)",
        highlight: "var(--highlight)",
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
        divider: "var(--divider)",
      },
    },
  },
  plugins: [],
};
export default config;
