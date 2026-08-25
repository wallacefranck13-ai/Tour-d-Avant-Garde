let store: Record<string, string> = {};

export default {
  getItem: jest.fn(async (key: string) => (key in store ? store[key] : null)),
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((key) => delete store[key]);
  }),
  __reset: () => {
    store = {};
  },
};
