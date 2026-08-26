/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // requestAnimationFrame est mocké par react-native/jest/setup.js via un
  // vrai setTimeout(0) : sous charge (CI), son callback peut se déclencher
  // après la fin d'un test et mettre à jour un composant (TouchableOpacity)
  // hors act(), avec parfois un vrai flake. Les timers fake (auto-détectés
  // par @testing-library/react-native ^12) éliminent la course.
  fakeTimers: { enableGlobally: true },
};
