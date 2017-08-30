/* eslint-disable import/no-unresolved,import/extensions */
import {
	match,
} from 'react-router';

export default function(base = think.controller.base) {
	return class extends base {
		init(http) {
			super.init(http);
			this._baseAssigned = true;
		}
		async display(routesFile, ...args) {
			const {
				getCreateElement = function getCreateElement() {},
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

			// eslint-disable-next-line camelcase
			if (!server_render) {
				super.assign('context', context);
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

			return new Promise((resolve) => {
				match({
					routes,
					location: urlStr,
					basename,
				}, (error, redirectLocation, renderProps) => {
					let result;
					if (error) {
						// console.log(500);
						this.http.error = error;
						result = think.statusAction(500, this.http);
					} else if (redirectLocation) {
						// console.log(302, redirectLocation.pathname + redirectLocation.search);
						result = this.redirect(basename + redirectLocation.pathname + redirectLocation.search, 302);
					} else if (renderProps) {
						// console.log(200)

						super.assign('renderProps', {
							...renderProps,
							createElement: getCreateElement(context),
						});
						super.assign('context', context);
						result = super.display(routesFile, ...args);
					} else {
						// console.log(404)
						result = think.statusAction(404, this.http);
					}
					resolve(result);
				});
			});
		}
	};
}
