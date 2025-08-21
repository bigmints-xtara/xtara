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
        'monasans': ['MonaSans', 'sans-serif'],
        'monasans-heading': ['MonaSans', 'sans-serif'],
      },
      fontWeight: {
        'light': '300',
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.4' }],
        'title-large': ['2rem', { lineHeight: '1.5' }],
        'title-medium': ['1.25rem', { lineHeight: '1.6' }],
        'title-small': ['1rem', { lineHeight: '1.5' }],
        'subtitle': ['1.25rem', { lineHeight: '1.6' }],
        'body-large': ['1rem', { lineHeight: '1.5' }],
        'body-medium': ['0.875rem', { lineHeight: '1.4285' }],
        'body-small': ['0.75rem', { lineHeight: '1.6666' }],
        'caption': ['0.75rem', { lineHeight: '1.3333' }],
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
  corePlugins: {
    // Disable fontStyle plugin to prevent italic classes - GitHub Primer compliance
    fontStyle: false,
  },
  plugins: [],
};
export default config;
