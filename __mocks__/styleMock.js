// Mock CSS modules — return empty object so className lookups don't crash
module.exports = new Proxy(
  {},
  {
    get: function (_, prop) {
      return prop === '__esModule' ? true : prop;
    },
  }
);
