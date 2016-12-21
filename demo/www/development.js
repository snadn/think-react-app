var thinkjs = require('thinkjs');
var path = require('path');

var rootPath = path.dirname(__dirname);

var VIEW_PATH = rootPath + '/view';
require("babel-core/register")(think.extend({
	only: VIEW_PATH,
}, {
	"presets": [
		["es2015", {
			"loose": true
		}],
		"stage-1",
		"react"
	],
	"plugins": [
		"transform-runtime",
		/*["webpack-alias", {
			"config": __dirname + "/webpack.config.js"
		}]*/
	]
}));

var instance = new thinkjs({
  APP_PATH: rootPath + path.sep + 'app',
  RUNTIME_PATH: rootPath + path.sep + 'runtime',
  ROOT_PATH: rootPath,
  RESOURCE_PATH: __dirname,
  env: 'development'
});

// Build code from src to app directory.
instance.compile({
  log: true,
  presets: [],
  plugins: []
});

// 监听view变化
var viewReloadInstance = instance.getReloadInstance(VIEW_PATH);
viewReloadInstance.run();

instance.run();
