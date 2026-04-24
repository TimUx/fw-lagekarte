const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'renderer/collections.js',
        'renderer/formatters.js',
        'storage.js',
        'sync.js',
        'embedded-server.js',
      ],
      exclude: ['tests/**', 'node_modules/**'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          include: ['tests/unit/**/*.test.js'],
        },
      },
      {
        test: {
          name: 'integration',
          globals: true,
          include: ['tests/integration/**/*.test.js'],
          testTimeout: 15000,
          hookTimeout: 15000,
        },
      },
    ],
  },
});
