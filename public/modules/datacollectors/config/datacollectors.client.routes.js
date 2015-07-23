'use strict';

//Setting up route
angular.module('datacollectors').config(['$stateProvider',
	function($stateProvider) {
		// Datacollectors state routing
		$stateProvider.
		//state('document-upload', {
		//	url: '/document-upload',
		//		templateUrl: 'modules/datacollectors/views/document-upload.client.view.html'
		//}).
		//	state('sfupdate', {
		//		url: '/sfupdate',
		//		templateUrl: 'modules/datacollectors/views/salesforce-update.client.view.html'
		//	}).
         //   state('internal-demand', {
         //       url: '/internal-demand',
         //       templateUrl: 'modules/datacollectors/views/internal-dc-demand.client.view.html'
         //   }).
         //   state('update-playcard', {
         //       url: '/update-playcard',
         //       templateUrl: 'modules/datacollectors/views/update-playcard.client.view.html'
         //   }).
         //   state('view-playcard', {
         //       url: '/view-playcard',
         //       templateUrl: 'modules/datacollectors/views/playcard-v2.html'
         //   }).
         //   state('dashboard', {
         //       url: '/dashboard',
         //       templateUrl: 'modules/datacollectors/views/dashboard.client.view.html'
         //   }).
		//	state('dataexplorer', {
		//		url: '/dataexplorer',
		//		templateUrl: 'modules/datacollectors/views/dataexplorer.client.view.html'
		//	}).
         //   state('request-access', {
         //       url: '/request-access',
         //       templateUrl: 'modules/datacollectors/views/access-request-form.html'
         //   }).
         //   state('initial-access-request-feedback', {
         //       url: '/initial-access-request-feedback',
         //       templateUrl: 'modules/datacollectors/views/access-request-initial-feedback.html'
         //   }).
            state('review-board', {
                url: '/review-board',
                templateUrl: 'modules/datacollectors/views/review-board.html'
            }).
            state('admin', {
                url: '/admin',
                templateUrl: 'modules/datacollectors/views/admin-index.client.view.html'
            });
            //state('request-new-functionality', {
            //    url: '/request-new-functionality',
            //    templateUrl: 'modules/datacollectors/views/request-new-functionality.html'
            //}).
            //state('review-requests-for-new-functionality', {
            //    url: '/review-requests-for-new-functionality',
            //    templateUrl: 'modules/datacollectors/views/new-functionality-request-listing.html'
            //});
	}
]);
