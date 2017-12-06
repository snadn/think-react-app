/* eslint-disable import/no-unresolved,import/extensions */
import path from 'path';
import fs from 'fs';
import {
	createElement,
} from 'react';
import {
	renderToString,
} from 'react-dom/server';

const readFile = think.promisify(fs.readFile, fs);

/* eslint-disable */
function mulReplace(s, arr) {
	for (var i = 0; i < arr.length; i++) {
		s = s.replace(arr[i][0], arr[i][1]);
	}
	return s;
}
function encode4Js(s) {
	return mulReplace(s, [
		[/\\/g, "\\u005C"],
		[/"/g, "\\u0022"],
		[/'/g, "\\u0027"],
		[/\//g, "\\u002F"],
		[/\r/g, "\\u000A"],
		[/\n/g, "\\u000D"],
		[/\t/g, "\\u0009"]
	]);
}
/*eslint-enable*/

async function getBaseHtml(templateFile, config) {
	const ext = path.extname(templateFile);
	const file = templateFile.slice(0, -ext.length) + config.file_ext;
	let baseHtml = '{{html}}';

	try {
		baseHtml = await readFile(file, 'utf-8');
	} catch (e) {
		think.log(`file not exist: ${file}`, 'think-react-app');
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
			globalVarName: 'G',
		}, config));

		const {
			globalVarName: G,
			server_render,
		} = options;

		const {
			// http,
			context,
			renderProps,
		} = tVar;

		let html = '';
		// eslint-disable-next-line camelcase
		if (server_render) {
			html = renderToString(createElement(think.safeRequire('react-router').RouterContext, renderProps));
		}

		const base = await getBaseHtml(templateFile, config);

		const render = {
			[`${G}Str`]: encode4Js(JSON.stringify({
				...global[G],
				context,
			})),
			html,
		};

		// eslint-disable-next-line no-shadow
		return Object.keys(render).reduce((html, key) => html.replace(`{{${key}}}`, render[key]), base);
	}
}
