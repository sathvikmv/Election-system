const BigQuery = jest.fn().mockImplementation(() => ({
  dataset: jest.fn(() => ({
    table: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve()),
    })),
  })),
}));

module.exports = { BigQuery };
