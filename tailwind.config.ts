import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{html,ts,tsx,js,jsx}', // Adjust paths based on your project structure
  ],
  theme: {
    extend: {
      // Add customizations here, e.g., colors, spacing, etc.
    },
  },
  plugins: [],
};

export default config;
