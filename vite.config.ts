
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disabled for production security (hides source code structure)
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'zustand', 'date-fns', 'lucide-react']
            }
        }
    }
  },
  server: {
    port: 3000,
  }
});
