require('babel-polyfill');

const React = require('react');
const ReactDOM = require('react-dom');

const App = require('./src/App.jsx');

require('!!style-loader?sourceMap!css-loader!postcss-loader?sourceMap!./index.pcss');

const reactRoot = document.querySelector('.app');

ReactDOM.render(<App/>, reactRoot);
