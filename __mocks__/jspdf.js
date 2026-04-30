const jsPDF = jest.fn().mockImplementation(() => ({
  internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  line: jest.fn(),
  addImage: jest.fn(),
  save: jest.fn(),
}));

module.exports = jsPDF;
module.exports.default = jsPDF;
