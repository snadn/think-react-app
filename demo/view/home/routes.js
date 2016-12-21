import React from 'react'
import App from './app'

export default {
	path: '/',
	component: App,
	childRoutes: [
		{
			path: 'test',
			component: function() { return <p>test</p> }
		}
	]
}