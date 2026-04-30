// Mock for @/lib/firebase persistence API
module.exports = {
  db: {},
  saveSession: jest.fn(() => Promise.resolve()),
  loadSession: jest.fn(() => Promise.resolve(null)),
};
