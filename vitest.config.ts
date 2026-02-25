import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    setupFiles: ['./src/test/setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'server/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
