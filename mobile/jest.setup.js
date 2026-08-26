// Évite les timers d'animation (TouchableOpacity, etc.) qui continuent après
// la fin d'un test et déclenchent des mises à jour hors act() sur le test
// suivant — source de flakiness observée en conditions CI (--ci).
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
