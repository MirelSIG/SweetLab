module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/models/**'
  ],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 45,
      lines: 55,
      statements: 55
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
