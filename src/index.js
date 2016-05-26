import path from 'path';
import ReactTempAdapter from './adapter/template/react';

export function init() {
	think.adapter('template', 'react', ReactTempAdapter);

	think.middleware('react_template', (http, templateFile) => {
		if(think.isObject(templateFile)){
			if (templateFile.type === 'react') {
				templateFile = path.normalize(`${templateFile.root_path}/${http.module}/${templateFile.file_name}`);
			} else {
				templateFile = templateFile.templateFile;
			}
		}

		return templateFile;
	});

	think.hook('view_template', ['react_template'], 'prepend');
}

export default {
	init
}