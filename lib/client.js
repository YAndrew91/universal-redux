'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactRouter = require('react-router');

var _create = require('./shared/create');

var _create2 = _interopRequireDefault(_create);

var _devtools = require('./client/devtools');

var _routes = require('routes');

var _routes2 = _interopRequireDefault(_routes);

var _middleware = require('middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _rootComponent = require('rootComponent');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dest = document.getElementById('content');

// dependencies of external source. these resolve via webpack aliases
// as assigned in merge-configs.js

var store = (0, _create2.default)(_middleware2.default, _reactRouter.browserHistory, window.__data);
var routes = (0, _routes2.default)(store);
var devComponent = (0, _devtools.render)();

// There is probably no need to be asynchronous here
(0, _rootComponent.createForClient)(store, { routes: routes, history: _reactRouter.browserHistory }).then(function (_ref) {
  var root = _ref.root;

  _reactDom2.default.render(root, dest);

  if (process.env.NODE_ENV !== 'production') {
    window.React = _react2.default; // enable debugger
    if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
      throw new Error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
    }
  }

  return devComponent ? (0, _rootComponent.createForClient)(store, { routes: routes, history: _reactRouter.browserHistory, devComponent: devComponent }) : {};
}).then(function (_ref2) {
  var root = _ref2.root;

  if (root) _reactDom2.default.render(root, dest);
}).catch(function (err) {
  console.error(err, err.stack);
});