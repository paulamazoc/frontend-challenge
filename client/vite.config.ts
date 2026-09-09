import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api calls to the Express server so the browser sees one origin.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // Pinned west of Greenwich on purpose: it is where naive calendar-date
    // handling shifts YYYY-MM-DD by a day, so the date tests can prove it doesn't.
    env: { TZ: 'America/Vancouver' },
    include: ['src/**/*.test.ts'],
  },
});
