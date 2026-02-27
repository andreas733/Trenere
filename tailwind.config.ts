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
        ssk: {
          blue: "#0c3a6e",
          700: "#0a2f57",
          800: "#082648",
          500: "#1a4d7a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
