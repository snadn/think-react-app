import path from 'path';
import fs from 'fs';
import url from 'url';
import {
	createElement
} from 'react';
import {
	renderToString
} from 'react-dom/server';
import {
	RouterContext
} from 'react-router';

const exists = function(path) {
	return new Promise((resolve) => {
		fs.exists(path, (exists) => {
			resolve(exists);
		});
	})
};
const readFile = think.promisify(fs.readFile, fs);

async function getBaseHtml(templateFile) {
	let baseHtml = '{{html}}';
	let ext = path.extname(templateFile);
	let file = templateFile.slice(0, -ext.length) + think.config('view').file_ext;

	if (await exists(file)) {
		baseHtml = await readFile(file, 'utf-8');
	}

	return baseHtml;
}

export default class extends think.adapter.base {
	/**
	 * get compiled content
	 * @params {String} templateFile 模版文件目录
	 * @params {Object} tVar 模版变量
	 * @params {Object} config 模版引擎配置
	 * @return {Promise} []
	 */
	async run(templateFile, tVar, config) {

		const options = think.parseConfig(think.extend({
			globalVarName: 'G'
		}, think.config('view'), config));

		const {
			globalVarName: G,
			server_render
		} = options;

		const {
			http,
			context,
			renderProps
		} = tVar;

		let html = '';
		if (server_render) {
			html = renderToString(createElement(RouterContext, renderProps));
		}

		const base = await getBaseHtml(templateFile);

		const render = {
			[`${G}Str`]: JSON.stringify({
				...global[G],
				context
			}),
			html
		};

		return Object.keys(render).reduce(function(html, key) {
			return html.replace('{{' + key + '}}', render[key]);
		}, base);
	}
}