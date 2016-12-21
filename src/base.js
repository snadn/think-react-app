import url from 'url';
import path from 'path';
import React from 'react';
import {
	match
} from 'react-router';

export default function(base = think.controller.base) {
	return class extends base {
		init(http) {
			super.init(http);
			this._baseAssigned = true;
		}

		async __before() {
			const http = this.http;
			const controller = this.get('controller');
			const action = this.get('action') || 'index';

			if (!http.isReaction && controller) {
				http.isReaction = true;

				return this.action(controller, action).then(() => {
					return think.prevent();
				}).catch((e) => {
					const log = think.config('view.log');

					if (think.isPrevent(e)) {
						// 有自定义controller
						log && think.log(`reaction sucess: ${controller}/${action} ${http.controller}/${http.action}`, 'LOG');
						return think.prevent();
					}
					// 无自定义controller
					log && think.log(`reaction fail: ${controller}/${action} ${http.controller}/${http.action}`, 'LOG');
				});
			} else {
				return super.__before && super.__before();
			}
		}

		async display(routesFile, ...args) {

			const {
				getCreateElement = function(context) {},
					getRoutes = function(routesFile, context) {
						// 使用 think.require，可处理 es module
						return think.require(routesFile);
					},
					...context
			} = this.assign();

			this._baseAssigned = false;
			this._baseAssign();

			const {
				globalVarName = 'G',
					server_render
			} = think.parseConfig(think.config('view'));

			const G = global[globalVarName] || {};
			const basename = context.basename || G.root || '/';

			if (!server_render) {
				super.assign('context', context);
				return super.display(routesFile, ...args);
			}

			routesFile = routesFile || await this.hook('view_template', think.config('view'));
			const routes = getRoutes(routesFile, context);

			let urlStr = this.http.req.url;

			if (!!basename && urlStr.indexOf(basename) === 0) {
				urlStr = urlStr.substr(basename.length) || '/';
			}

			// const location = url.parse(urlStr, true, true); // query 需要为对象

			match({
				routes,
				location: urlStr,
				basename
			}, (error, redirectLocation, renderProps) => {

				if (error) {
					// console.log(500);
					this.http.error = error;
					return think.statusAction(500, this.http);
				} else if (redirectLocation) {
					// console.log(302, redirectLocation.pathname + redirectLocation.search);
					this.redirect(basename + redirectLocation.pathname + redirectLocation.search, 302);
				} else if (renderProps) {
					// console.log(200)
					renderProps.createElement = getCreateElement(context);

					super.assign('renderProps', renderProps);
					super.assign('context', context);
					return super.display(routesFile, ...args);
				} else {
					// console.log(404)
					return think.statusAction(404, this.http);
				}
			});
		}
	}
}