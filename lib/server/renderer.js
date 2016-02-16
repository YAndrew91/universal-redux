'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _reactRouter = require('react-router');

var _prettyError = require('pretty-error');

var _prettyError2 = _interopRequireDefault(_prettyError);

var _createMemoryHistory = require('react-router/lib/createMemoryHistory');

var _createMemoryHistory2 = _interopRequireDefault(_createMemoryHistory);

var _create = require('../shared/create');

var _create2 = _interopRequireDefault(_create);

var _configure = require('../configure');

var _configure2 = _interopRequireDefault(_configure);

var _html = require('./html');

var _html2 = _interopRequireDefault(_html);

var _tools = require('./tools');

var _tools2 = _interopRequireDefault(_tools);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false; // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';

exports.default = function (projectConfig, projectToolsConfig) {
  var tools = (0, _tools2.default)(projectConfig, projectToolsConfig);
  var config = (0, _configure2.default)(projectConfig);
  var getRoutes = require(_path2.default.resolve(config.routes)).default;
  var rootComponent = require(config.rootComponent ? _path2.default.resolve(config.rootComponent) : '../helpers/rootComponent');
  var pretty = new _prettyError2.default();

  return function (req, res) {
    if (__DEVELOPMENT__) {
      // Do not cache webpack stats: the script file would change since
      // hot module replacement is enabled in the development env
      tools.refresh();
    }

    var middlewareOptions = {};

    if (!__DISABLE_SSR__) {
      middlewareOptions.cookie = req.headers.cookie;
    }

    var middleware = config.redux.middleware ? require(_path2.default.resolve(config.redux.middleware)).default(middlewareOptions) : [];
    var history = (0, _createMemoryHistory2.default)();
    var store = (0, _create2.default)(middleware, history);

    if (__DISABLE_SSR__) {
      var content = (0, _html2.default)(config, tools.assets(), store, res._headers);
      res.status(200).send(content);
    } else {
      (0, _reactRouter.match)({ history: history, routes: getRoutes(store), location: req.originalUrl }, function (error, redirectLocation, renderProps) {
        if (redirectLocation) {
          res.redirect(redirectLocation.pathname + redirectLocation.search);
        } else if (error) {
          console.error('ROUTER ERROR:', pretty.render(error));
          res.status(500);
        } else if (renderProps) {
          rootComponent.createForServer(store, renderProps).then(function (_ref) {
            var root = _ref.root;

            var content = (0, _html2.default)(config, tools.assets(), store, res._headers, root);
            var pageState = store.getState().page;
            res.status(pageState && pageState.status || 200).send(content);
          }).catch(function (err) {
            console.log('ERROR GENERATING ROOT COMPONENT', err, err.stack);
            res.status(500).send(err);
          });
        } else {
          res.status(404).send('Not found');
        }
      });
    }
  };
};