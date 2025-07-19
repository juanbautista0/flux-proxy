module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/index.ts',
  ],
   coverageThreshold: {
     global: {
       branches: 80,
       functions: 80,
       lines: 80,
       statements: 80
     }
   },
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};