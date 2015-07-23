'use strict';

angular.module('datacollectors').controller('AccessRequestController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors','$state',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors,$state) {
        $scope.authentication = Authentication;

        $scope.currentUser = Authentication.user;

        $scope.appAreas = [
            {
                name: 'Data Upload',
                role: 'document-upload'
            },
            {
                name: 'Data Explorer',
                role: 'data'
            },
            {
                name: 'SalesForce DC Demand',
                role: 'sfupdate'
            },
            {
                name: 'Internal DC Demand',
                role: 'admin'
            },
            {
                name: 'Update Play Cards',
                role: 'pcupdate'
            },
            {
              name: 'View Play Cards',
                role: 'pcviewer'
            },
            {
                name: 'Dashboards',
                role: 'dashviewer'
            }
        ];

        $scope.submitAccessRequest = function(){
            //alert('submitting access request for: ' + $scope.currentUser.email);

            var requestedRoles;

            $scope.appAreas.forEach(function(area){
               if(area.ticked){
                   if(requestedRoles !== undefined){
                       requestedRoles = requestedRoles + ',' + area.role;
                   }
                   else {
                       requestedRoles = area.role;
                   }
               }
            });

            var json = {
                firstName:   $scope.currentUser.firstName,
                lastName: $scope.currentUser.lastName,
                username: $scope.currentUser.username,
                email: $scope.currentUser.email,
                reason: $scope.reason,
                roles: requestedRoles
            };

            $http.post('/access_request', json)
                .success(function(data, status, headers, config) {
                    $state.go('initial-access-request-feedback');
                }).
                error(function(data, status, headers, config) {
                    alert('Error while posting access request');
                });
        }

    }
]);


