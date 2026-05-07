/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@vtt/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@vtt/shared-utils$': '<rootDir>/../../packages/shared-utils/src/index.ts',
    '^colyseus\\.js$': '<rootDir>/src/__mocks__/colyseus.js.ts',
    '\\.(css|scss)$': '<rootDir>/src/__mocks__/style.mock.ts',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(@colyseus|ioredis)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/api/**'],
};
