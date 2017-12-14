export default function(base = think.controller.base) {
	return class extends base {
		init(http) {
			super.init(http);
			this._baseAssigned = true;
		}
		async display(routesFile, ...args) {
			const {
				getRoutes = function getRoutes(routesFile, context) { // eslint-disable-line
					// 使用 think.require，可处理 es module
					return think.require(routesFile);
				},
				...context
			} = this.assign();

			this._baseAssigned = false;
			this._baseAssign();

			const {
				globalVarName = 'G',
				server_render,
			} = think.parseConfig(this.config('view'));

			const G = global[globalVarName] || {};
			const basename = context.basename || G.root || '/';

			super.assign('context', context);
			// eslint-disable-next-line camelcase
			if (!server_render) {
				return super.display(routesFile, ...args);
			}

			// eslint-disable-next-line no-param-reassign
			routesFile = routesFile || await this.hook('view_template', this.config('view'));
			const routes = getRoutes(routesFile, context);

			let urlStr = this.http.req.url;

			if (!!basename && urlStr.indexOf(basename) === 0) {
				urlStr = urlStr.substr(basename.length) || '/';
			}

			// const location = url.parse(urlStr, true, true); // query 需要为对象

			super.assign('renderProps', {
				routes,
				location: urlStr,
				basename,
			});
			return super.display(routesFile, ...args);
		}
	};
}
