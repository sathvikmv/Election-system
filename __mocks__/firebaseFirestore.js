module.exports = {
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  collection: jest.fn(() => ({})),
};
