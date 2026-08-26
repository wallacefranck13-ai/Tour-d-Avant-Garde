/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
};
