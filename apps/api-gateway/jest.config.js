/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  moduleNameMapper: {
    '^@vtt/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@vtt/shared-utils$': '<rootDir>/../../packages/shared-utils/src',
    '^@vtt/shared-auth$': '<rootDir>/../../packages/shared-auth/src',
    '^@vtt/shared-config$': '<rootDir>/../../packages/shared-config/src',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coverageThreshold: { global: { lines: 80 } },
};
