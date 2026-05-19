import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF8F0",
        primary: {
          DEFAULT: "#E8736A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5E6D3",
          foreground: "#3D2C2E",
        },
        accent: {
          DEFAULT: "#D4A853",
          foreground: "#FFFFFF",
        },
        foreground: "#3D2C2E",
        muted: {
          DEFAULT: "#F5E6D3",
          foreground: "#7A6365",
        },
        border: "#E8D5C4",
        ring: "#E8736A",
        reserved: "#7BC47F",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
}
export default config
