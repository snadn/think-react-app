import base from 'think-react-app/lib/base'

import React from 'react';

export default class extends base() {
	async __before() {
		return super.__before();
		let user = await this.session('user');

		if (user) {
			user = think.extend({}, user); // 复制user, 防止在view被修改，影响session
		}

		this.assign('user', user);
    this.assign('version', '1.0.0');
	}
	indexAction() {
		this.__call();
	}
	__call() {
		this.display();
	}
}