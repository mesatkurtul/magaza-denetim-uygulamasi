/**
 * Tailwind CSS Configuration File
 *
 * This file is used to configure the Tailwind CSS framework for the Store Audit Application.
 */

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Example primary color
        secondary: '#EC4899', // Example secondary color
      },
    },
  },
  plugins: [],
};