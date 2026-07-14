/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.tsx?$': [
        'ts-jest',
        {
          // solve ts-jest[config] (WARN) message TS151001
          tsconfig: 'tsconfig.json',
          esModuleInterop: true,
        },
      ],
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [],
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/coverage/**',
      '!**/vendor/**',
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/',
      '/coverage/',
      '/vendor/',
      '\\.d\\.ts$',
    ],
    coverageReporters: ['json', 'json-summary', 'lcov', 'text'],
  };

