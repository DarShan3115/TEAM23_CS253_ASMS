/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defining the ASMS Brand Palette
        brand: {
          dark: "#09090b",     // Zinc-950
          border: "#27272a",   // Zinc-800
          primary: "#2563eb",  // Blue-600
          accent: "#3b82f6",   // Blue-500
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}