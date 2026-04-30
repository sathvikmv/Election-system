// Mock for react-markdown using CommonJS
const React = require('react');

const ReactMarkdown = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

module.exports = ReactMarkdown;
