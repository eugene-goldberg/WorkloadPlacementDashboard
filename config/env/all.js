'use strict';

module.exports = {
	app: {
		title: 'Workload Placement Dashboard',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3004,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap-custom/bootstrap-paper.css',
				//'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/modules/datacollectors/css/isteven-multi-select.css',
				'http://cdn3.devexpress.com/jslib/15.1.4/css/dx.common.css',
				'http://cdn3.devexpress.com/jslib/15.1.4/css/dx.light.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular.min.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-resource.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-cookies.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-animate.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-touch.js',
				'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.0/angular-sanitize.js',
				'http://cdnjs.cloudflare.com/ajax/libs/globalize/0.1.1/globalize.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-route/angular-route.js',
				'public/lib/angular-file-upload/angular-file-upload.js',
				'public/lib/angular-bootstrap/ui-bootstrap.js',
				'public/lib/isteven-multi-select.js',
				'http://cdn3.devexpress.com/jslib/15.1.4/js/dx.all.js',
				'https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.js',
				'public/modules/datacollectors/directives/ng.directives.js'

			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
