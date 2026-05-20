import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // We still use CSS variables in globals.css, but mapping them to Tailwind can be helpful
        // We'll rely on the custom variables for most things as requested in the prompt.
      },
    },
  },
  plugins: [],
};
export default config;
