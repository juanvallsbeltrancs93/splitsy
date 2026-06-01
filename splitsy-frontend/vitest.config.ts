import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@data': path.resolve(__dirname, './src/data'),
      '@tests': path.resolve(__dirname, './src/__tests__'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setupTests.ts',
    env: { TZ: 'UTC' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'coverage/**',
        'dist/**',
        'src/__tests__/**',
        'src/CompositionRoot.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/presentation/**/index.ts',
        'src/setupTests.ts',
        '**.json',
        '**.css',
        '**.svg',
        '**.png',
      ],
    },
  },
});
