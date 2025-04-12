import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path'; // Import the path module

export default defineConfig({
  plugins: [
    tailwindcss(),
    
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Map @/ to src/
    },
  },
});