module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.test.json',
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.orm-entity.ts',
    '!src/main.ts',
  ],
  moduleNameMapper: {
    '^@vtt/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@vtt/shared-events$': '<rootDir>/../../packages/shared-events/src',
    '^@vtt/shared-auth$': '<rootDir>/../../packages/shared-auth/src',
    '^@vtt/shared-config$': '<rootDir>/../../packages/shared-config/src',
    '^@vtt/shared-utils$': '<rootDir>/../../packages/shared-utils/src',
  },
};
