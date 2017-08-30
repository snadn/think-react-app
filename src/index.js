import path from 'path';
import ReactTempAdapter from './adapter/template/react';

export function init() {
	think.adapter('template', 'react', ReactTempAdapter);

	think.middleware('react_template', (http, templateFile) => {
		/* eslint-disable no-param-reassign */
		if (think.isObject(templateFile)) {
			templateFile = think.extend({
				root_path: `${think.ROOT_PATH}/view`,
				file_name: 'routes.js',
			}, think.parseConfig(templateFile));

			if (templateFile.type === 'react') {
				templateFile = path.normalize(`${templateFile.root_path}/${http.module}/${templateFile.file_name}`);
			} else {
				templateFile = templateFile.templateFile;
			}
		}

		return templateFile;
	});

	think.hook('view_template', ['react_template'], 'prepend');

	const app = think.require('app');
	app.prototype.getControllerInstance = function getControllerInstance() {
		const http = this.http;
		const name = `${http.module}/${think.dirname.controller}/${http.controller}`;
		const defaultName = `${http.module}/${think.dirname.controller}/base`;
		const Controller = think.require(name, true) || think.require(defaultName, true);

		if (!Controller) {
			return undefined;
		}
		const instance = new Controller(http);
		// rewrite action when controller is rest
		if (instance._isRest) {
			let method = instance._method;
			// get method from GET params
			if (method) {
				method = instance.get(method).toLowerCase();
			}
			if (!method) {
				method = this.http.method.toLowerCase();
			}
			this.http.action = method;
		}
		return instance;
	};
}

export default {
	init,
};
