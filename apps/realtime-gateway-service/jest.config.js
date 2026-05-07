/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  moduleNameMapper: {
    '^@vtt/shared-types$': '<rootDir>/../../packages/shared-types/src/index.ts',
    '^@vtt/shared-utils$': '<rootDir>/../../packages/shared-utils/src/index.ts',
    '^@vtt/shared-events$': '<rootDir>/../../packages/shared-events/src/index.ts',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
};
