# think-react-app

thinkjs 插件，在 thinkjs 中使用 react 和 react-router 来构建同构的 webapp

## 安装

`npm install think-react-app --save`

## 使用

1. 编辑 src/common/bootstrap/plugins.js （如果没有则创建），引入插件

	```javascript
	import reactPlugin from 'think-react-app';
	reactPlugin.init();
	```

2. 让 base controller 继承于 'think-react-app/lib/base'，然后使用 `this.display()` 进行渲染

3. 修改 config/view 的 type 为 react

4. 在 view/home 中放入基于 react-router 的 webapp 代码

	此处入口 html 文件为 routes.html , routes 配置为 routes.js

	html 中通过 `window.G = {{GStr}};` 将服务器端的数据同步到浏览器端，
	通过 `<div id="react-wraper">{{html}}</div>` 作为服务端渲染的占位符

5. 在 www/static/js/ 中创建浏览器端执行脚本 app.js，例如

	```javascript
	import React from 'react'
	import { render } from 'react-dom'
	import { match, Router, useRouterHistory } from 'react-router'
	import createBrowserHistory from 'history/lib/createBrowserHistory'

	import rootRoute from 'view/mobile/routes'

	const history = useRouterHistory(createBrowserHistory)({
		basename: G.root
	});


	const lazyRender = (history, routes) => {

		const { pathname, search, hash } = window.location

		match({
			routes,
			history
		}, (error, redirectLocation, renderProps) => {

			if (redirectLocation) {
				history.replace(redirectLocation);
				// redirect and re render
				lazyRender(history, routes)
			} else {
				render(
					<Router {...renderProps} />,
					document.getElementById('react-wraper')
				)
			}
		})
	}

	lazyRender(history, rootRoute);

	```

**ps:可以参考demo进行相关配置**

## 潜规则

1. 在 node 端

	- 可以通过 `this.assign('getCreateElement', getCreateElement);` 自定义 react-router 渲染时的 createElement 参数，
	若有使用 redux 等框架，可以在里面处理。
	- 可以通过 `this.assign('getRoutes', getRoutes);` 自定义 routes配置的获取

2. 处理 routes.html 模板时

	- 使用服务端渲染的字符串替换 {{html}}
	- 将全局变量 G JSON.stringify 后，替换 {{GStr}}。
	全局变量 G 中会加入 context， context 中为 controller 中 assgin 传入的参数（除 getCreateElement 和 getRoutes），浏览器中可以通过 G.context 来获取单个请求相关的信息。

## 配置

```javascript
export default {
	type: 'react',
	content_type: 'text/html',
	file_ext: '.html',
	file_depr: '_',
	root_path: think.ROOT_PATH + '/view',
	file_name: 'routes.js', // routes 配置文件名，node端渲染时会取其同名的 .html 文件进行渲染
	server_render: true, // 是否启用服务器端渲染
	globalVarName: 'G' // 自定义全局变量的名称
};
```
