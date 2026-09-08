import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
export default defineConfig({ plugins: [preact()], test: { maxWorkers: 1, fileParallelism: false, environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'], setupFiles: ['./src/test/setup.ts'] } });
