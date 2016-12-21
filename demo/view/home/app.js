import React from 'react'

export default class App extends React.Component {
	render() {
		return <app>
			<h1>Hello Think-React-App</h1>
			{this.props.children}
		</app>
	}
}