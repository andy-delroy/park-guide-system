import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✅ Required for alias resolution

export default defineConfig({
  plugins: [
    laravel({
      input: 'resources/js/main.jsx', // or 'app.jsx' depending on your entry
      refresh: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources/js'), // ✅ Set up @ to point to resources/js
    },
  },
});
