// Jest DOM matchers (toBeInTheDocument, etc.)
import '@testing-library/jest-dom';

// jsdom doesn't implement scrollIntoView — mock it globally
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

// jsdom doesn't implement window.print
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'print', { value: jest.fn(), writable: true });
}

// Mock Firebase (Firestore) — prevents real network calls in tests
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  collection: jest.fn(() => ({})),
}));

// Mock @google-cloud/bigquery — prevents real GCP calls in tests
jest.mock('@google-cloud/bigquery', () => ({
  BigQuery: jest.fn().mockImplementation(() => ({
    dataset: jest.fn(() => ({
      table: jest.fn(() => ({
        insert: jest.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-session-uuid-1234'),
}));

// Mock html2canvas and jspdf (browser APIs not available in Node)
jest.mock('html2canvas', () => jest.fn(() => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,mock',
  height: 100,
  width: 100,
})));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    addImage: jest.fn(),
    save: jest.fn(),
  }));
});
