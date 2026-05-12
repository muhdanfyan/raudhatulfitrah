import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './tests/coverage',
      exclude: ['node_modules', 'dist', 'tests']
    }
  }
});