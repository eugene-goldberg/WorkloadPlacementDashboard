'use strict';

// Datacollectors controller
angular.module('datacollectors').controller('AdminController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors) {
        $scope.authentication = Authentication;

        $scope.users;

        $scope.roles;

        $scope.accessRequests;

        $scope.requestedRoles;

        $scope.userEmail;

        $scope.userDisplayName;

        $scope.selectedRoles = [];

        function getUsers(){
            $http({
                method: 'GET',
                url: '/users'
            }).success(function(data){
                $scope.users = data;
            }).error(function(){
                alert('error');
            });
        }

        function getRoles(){
            $http({
                method: 'GET',
                url: '/roles'
            }).success(function(data){
                $scope.roles = data;
            }).error(function(){
                alert('error');
            });
        }

        function getAccessRequests(){
            $http({
                method: 'GET',
                url: '/access_requests_listing'
            }).success(function(data){
                $scope.accessRequests = data;
            }).error(function(){
                alert('error');
            });
        }

        $scope.grantSelectedRolesToSelectedUsers = function(){
            if($scope.userDisplayName){
                $scope.selectedRoles.forEach(function(role){
                    var json = {
                        requestedRoles: $scope.selectedRoles,
                        userEmail:  $scope.userEmail
                    };
                    $http.post('/grant_requested_roles', json)
                        .success(function(data, status, headers, config) {

                        }).
                        error(function(data, status, headers, config) {
                            alert('Error while granting requested roles');
                        });
                })
            }
        };

        $scope.generatePlaycardsFromDcInventory = function(){
            $http.post('/generate_playcards', {})
                .success(function(data, status, headers, config) {

                }).
                error(function(data, status, headers, config) {
                    alert('Error while generating Playcards');
                });
        };

        $scope.grantRequestedRoles = function(){
          //alert('Granting roles: ' + $scope.requestedRoles + '  to  ' + $scope.userEmail);
            var json = {
                requestedRoles: $scope.requestedRoles,
                userEmail:  $scope.userEmail
            };
            $http.post('/grant_requested_roles', json)
                .success(function(data, status, headers, config) {
                        alert('Requested roles have been successfully granted');

                    $http.post('/remove_access_request', json)
                        .success(function(data, status, headers, config) {
                            for(var i = 0; i < $scope.accessRequests.length; i++) {
                                if($scope.accessRequests[i].email == $scope.userEmail) {
                                    $scope.accessRequests.splice(i, 1);
                                    break;
                                }
                            }
                        }).
                        error(function(data, status, headers, config) {
                            alert('Error while granting requested roles');
                        });


                    //for(var i = 0; i < $scope.accessRequests.length; i++) {
                    //    if($scope.accessRequests[i].email == $scope.userEmail) {
                    //        $scope.accessRequests.splice(i, 1);
                    //        break;
                    //    }
                    //}
                }).
                error(function(data, status, headers, config) {
                    alert('Error while granting requested roles');
                });
        };

        $scope.removeSelectedAccessRequest = function(){
            if($scope.userEmail){
                var json = {userEmail: $scope.userEmail};
                $http.post('/remove_access_request', json)
                    .success(function(data, status, headers, config) {
                        for(var i = 0; i < $scope.accessRequests.length; i++) {
                            if($scope.accessRequests[i].email == $scope.userEmail) {
                                $scope.accessRequests.splice(i, 1);
                                break;
                            }
                        }
                    }).
                    error(function(data, status, headers, config) {
                        alert('Error while granting requested roles');
                    });
            }
        };

        $scope.removeSelectedUsers = function(){
            if($scope.userEmail){
                var json = {email: $scope.userEmail};
                $http.post('/remove_users', json)
                    .success(function(data, status, headers, config) {
                        for(var i = 0; i < $scope.users.length; i++) {
                            if($scope.users[i].Email == $scope.userEmail) {
                                $scope.users.splice(i, 1);
                                break;
                            }
                        }
                    }).
                    error(function(data, status, headers, config) {
                        alert('Error while granting requested roles');
                    });
            }
        };

        getUsers();
        getRoles();
        getAccessRequests();

        $scope.usersGridOptions = {
            bindingOptions: {
                dataSource: 'users',
                columns: 'collectionDatafields'
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
            rowAlternationEnabled: true,
            allowColumnReordering: true,
            allowColumnResizing: true,
            columnAutoWidth: true,
            columnChooser:  {
                enabled: true

            },
            selection: {
                mode: 'single'
            },
            onSelectionChanged: function (selecteditems) {
                var data = selecteditems.selectedRowsData;
                if (data.length > 0) {
                    $scope.userEmail = data[0].Email;
                    $scope.userDisplayName = data[0].DisplayName;
                }
                else {

                }
            }
        };

        $scope.rolesGridOptions = {
            bindingOptions: {
                dataSource: 'roles',
                columns: 'collectionDatafields'
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
                if (data.length > 0) {
                    $scope.selectedRoles.push(data[0].name);
                }
                else {

                }
            }
        };

        $scope.accessRequestsGridOptions = {
            bindingOptions: {
                dataSource: 'accessRequests',
                columns: 'collectionDatafields'
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

                    $scope.requestedRoles = data[0].RequestedRoles;
                    $scope.userEmail = data[0].email;

                }
                else {

                }


            }
        };
    }
]);

