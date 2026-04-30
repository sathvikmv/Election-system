module.exports = jest.fn(() => Promise.resolve({
  toDataURL: () => 'data:image/png;base64,mock',
  height: 100,
  width: 100,
}));
