'use strict';

angular.module('datacollectors').controller('NewFunctionalityRequestController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors','$state',
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

        $scope.newFunctionalityRequests = [];

        $scope.selectedRequestDescription;

        $scope.requestTitle;

        $scope.criticalityList = [
            {
                name: 'Urgent'
            },
            {
                name: 'High'
            },
            {
                name: 'Medium'
            },
            {
                name: 'Low'
            }
        ];

        function getNewFunctionalityRequests(){
            $http({
                method: 'GET',
                url: '/new_functionality_requests_listing'
            }).success(function(data){
                $scope.newFunctionalityRequests = data;
            }).error(function(){
                alert('error');
            });
        }

        var updateRequestJson = {
                requestTitle: $scope.requestTitle,
                email: $scope.currentUser.email,
                description: $scope.selectedRequestDescription,
                assignedTo: $scope.assignedTo,
                reviewedOn: $scope.reviewedOn,
                status: $scope.status,
                comments: $scope.comments

        };

        $scope.updateNewFunctionalityRequest = function(){
            $http.post('/new_functionality_request_update', {
                requestTitle: $scope.requestTitle,
                email: $scope.currentUser.email,
                description: $scope.selectedRequestDescription,
                assignedTo: $scope.assignedTo,
                reviewedOn: $scope.reviewedOn,
                status: $scope.status,
                comments: $scope.comments
            })
                .success(function(data, status, headers, config) {
                    alert('This request has been updated');
                }).
                error(function(data, status, headers, config) {
                    alert('Error while updating this request');
                });
        };

        $scope.submitNewFunctionalityRequest = function(){
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
                requestTitle: $scope.requestTitle,
                requestedDeliveryDate: $scope.requestedDeliveryDate,
                firstName:   $scope.currentUser.firstName,
                lastName: $scope.currentUser.lastName,
                username: $scope.currentUser.username,
                email: $scope.currentUser.email,
                description: $scope.description,
                appAreas: $scope.selectedAppAreas,
                criticality: $scope.selectedCriticality,
                stakeholderFirstName: $scope.stakeholderFirstName,
                stakeholderLastName: $scope.stakeholderLastName,
                stakeholderUserName: $scope.stakeholderUserName,
                stakeholderEmail: $scope.stakeholderEmail
            };

            $http.post('/new_functionality_request', json)
                .success(function(data, status, headers, config) {
                    $state.go('new-functionality-request-feedback');
                }).
                error(function(data, status, headers, config) {
                    alert('Error while posting new functionality request');
                });
        };

        $scope.newFunctionalityRequestsGridOptions = {
            bindingOptions: {
                dataSource: 'newFunctionalityRequests'

            },
            grouping: {
                autoExpandAll: true
            },
            groupPanel: {
                visible: true
            },
            filterRow: {
                visible: true,
                applyFilter: 'auto'
            },
            searchPanel: {
                visible: true,
                width: 240,
                placeholder: 'Search...'
            },
            paging: {
                enabled: true,
                pageSize: 10
            },
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [5, 10, 20]
            },
            columns: ['RequestTitle', 'RequestorFirstName', 'RequestorLastName',
                'StakeholderFirstName', 'StakeholdberLastName', 'RequestedDeliveryDate'],

            rowAlternationEnabled: true,
            allowColumnReordering: true,
            allowColumnResizing: true,
            columnAutoWidth: true,
            columnChooser:  {
                enabled: true

            },
            selection: {
                mode: 'multiple'
            },

            onSelectionChanged: function (selecteditems) {
                var data = selecteditems.selectedRowsData;
                if(data.length > 0){
                    //for(var prop in data[0]){
                    //    console.log('selected requests prop: ' + prop + '  selected requests value: ' + data[0][prop]);
                    //}

                    $scope.selectedRequestDescription = data[0].Description;
                    $scope.requestTitle = data[0].RequestTitle;
                    $scope.assignedTo = data[0].AssignedTo;
                    $scope.reviewedOn = data[0].ReviewedOn;
                    $scope.status = data[0].Status;
                    $scope.comments = data[0].Comments;
                }
                else {

                }


            }
        };
        getNewFunctionalityRequests();
    }
]);



