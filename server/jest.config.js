module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  collectCoverageFrom: ['routes/**/*.js', 'models/**/*.js', 'utils/**/*.js', 'middleware/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
