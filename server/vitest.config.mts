import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^#src\/(.*)$/, replacement: fromRoot('./src/$1') },
      { find: /^#tests\/(.*)$/, replacement: fromRoot('./tests/$1') },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          globalSetup: ['tests/integration/global-setup.ts'],
          testTimeout: 10_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
