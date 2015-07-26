'use strict';

// Datacollectors controller
angular.module('datacollectors').controller('ReviewBoardController', ['$scope', '$http', '$stateParams', '$location',
    '$socket', 'Authentication', 'Datacollectors',
    function($scope, $http, $stateParams, $location, $socket, Authentication, Datacollectors) {
        $scope.authentication = Authentication;

        $scope.currentUser = Authentication.user;

        $scope.userRole;

        $scope.authorizedUser = false;

        $scope.selectedOpportunityId;

        $scope.vote;

        $socket.on('updated', function(param) {
            alert('UPDATED ' + param);
        });

        function determineUserAuthorization(){
            //var authorizedRole;
            //authorizedRole = $.grep(Authentication.user.roles,function(element, index){
            //    return ( element.indexOf('product-manager') );
            //});
            $scope.currentUser.roles.forEach(function(role){
               if(role === 'product-manager'){
                    console.log('This user is a product manager');
                    $scope.authorizedUser = true;
                    $scope.userRole = role;
                }
                if(role === 'gdn-oversight'){
                    console.log('This user is a gdn oversight');
                    $scope.authorizedUser = true;
                    $scope.userRole = role;
                }
                if(role === 'relationship-manager'){
                    console.log('This user is a relationship manager');
                    $scope.authorizedUser = true;
                    $scope.userRole = role;
                }
            });
        }

        determineUserAuthorization();

        $scope.voteApprove = function(){
          $scope.vote = 'Approve';
            //will make http post here to '/salesforce_data_review', capturing opportunity id, which role have voted, vote, role-date voted, and comments
            //this post should update the DC record, matched by the DataCenterName
            $http.post('/salesforce_data_review', {})
                .success(function(data, status, headers, config) {
                    alert('Update successful');
                }).
                error(function(data, status, headers, config) {
                    alert('Error while updating');
                });
        };

        $scope.voteDisapprove = function(){
            $scope.vote = 'Need To Discuss';
            //will make http post here to '/salesforce_data_review', capturing opportunity id, which role have voted, vote, role-date voted, and comments
            //this post should update the DC record, matched by the DataCenterName
            $http.post('/salesforce_data_review', {})
                .success(function(data, status, headers, config) {
                    alert('Update successful');
                }).
                error(function(data, status, headers, config) {
                    alert('Error while updating');
                });
        };

        var data = [{
            "ID": 1,
            "OpportunityName": "Carrier Ent - D 123",
            "AccountName": "Carrier Enterprises",
            "CSCOpportunityID": "D-10170894",
            "KWL": "$5,2300",
            "StartDate": "12/12/2016",
            "RequestedDataCenters": "QTS Chicago, QTS Miami",
            "Status":   "Pending review",
            "DataCenters": [{
                "DataCenterName": "QTS Chicago",
                "Region": "Americas",
                "Country": "USA",
                "KWL": "17",
                "Cabinets": "5"
            }, {
                "DataCenterName": "QTS Miami",
                "Region": "Americas",
                "Country": "USA",
                "KWL": "11",
                "Cabinets": "3"
            }]
        },
            {
                "ID": 2,
                "OpportunityName": "AON App Mod 042",
                "AccountName": "AON",
                "CSCOpportunityID": "D-10170042",
                "KWL": "$7,4200",
                "StartDate": "09/12/2015",
                "RequestedDataCenters": "Sentinel Chicago",
                "Status":   "Pending review",
                "DataCenters": [{
                    "DataCenterName": "Sentinel Chicago",
                    "Region": "Americas",
                    "Country": "USA",
                    "KWL": "23",
                    "Cabinets": "9"
                }]},
                    {
                "ID": 3,
                "OpportunityName": "Zurich App Mod 042",
                "AccountName": "Zurich",
                "CSCOpportunityID": "D-10170042",
                "KWL": "$9,4200",
                "StartDate": "09/12/2015",
                "RequestedDataCenters": "Sentinel Chicago",
                        "Status":   "Pending review",
                "DataCenters": [{
                    "DataCenterName": "Sentinel Chicago",
                    "Region": "Americas",
                    "Country": "USA",
                    "KWL": "21",
                    "Cabinets": "9"
                }
                ]
            },
            {
                "ID": 4,
                "OpportunityName": "Motorola App Mod 042",
                "AccountName": "Motorola",
                "CSCOpportunityID": "D-10170765",
                "KWL": "$3,4200",
                "StartDate": "09/12/2017",
                "RequestedDataCenters": "QTS Chicago",
                "Status":   "Pending review",
                "DataCenters": [{
                    "DataCenterName": "QTS Chicago",
                    "Region": "Americas",
                    "Country": "USA",
                    "KWL": "21",
                    "Cabinets": "9"
                }
                ]
            }
        ];

        $scope.reviewBoardGridOptions = {
            dataSource: {
                store: {
                    type: 'array',
                    key: 'ID',
                    data: data
                }
            },
            searchPanel: {
                visible: true,
                width: 240,
                placeholder: 'Search...'
            },
            paging: {
                pageSize: 3
            },
            pager: {
                showPageSizeSelector: true,
                allowedPageSizes: [3, 5, 10, 20]
            },
            columns: [{
                dataField: 'CSCOpportunityID',
                caption: 'Opportunity ID',
                width: 120
            },
                {
                  dataField: 'OpportunityName',
                    caption: 'Name',
                    width:  110
                },
                'AccountName', {
                    dataField: 'KWL',
                    caption: 'KWL',
                    width: 80
                }, {
                    dataField: 'RequestedDataCenters',
                    width: 180
                }, {
                    dataField: 'StartDate',
                    dataType: 'date'
                },
                'Status'
            ],
            masterDetail: {
                enabled: true,
                template: function(container, options) {
                    var currentEmployeeData = data[options.key - 1];
                    container.addClass("internal-grid-container");
                    $("<div>").text("Details:").appendTo(container);
                    $('<div>')
                        .addClass("internal-grid")
                        .dxDataGrid({
                            columnAutoWidth: true,
                            columns: ['DataCenterName', {
                                dataField: 'Region',
                                caption: 'Data Center Name',
                                dataType: 'string'
                            }, {
                                dataField: 'Country',
                                dataType: 'string'
                            }, {
                                dataField: 'KWL',
                                caption: 'KWL',
                                dataType: 'string'
                            }, {
                                dataField: 'Cabinets',
                                caption: '# of cabinets',
                                dataType: 'string'
                            }],
                            dataSource: currentEmployeeData.DataCenters
                        }).appendTo(container);
                }
            },
            selection: {
                mode: 'single'
            },
            onSelectionChanged: function (selecteditems) {
                var data = selecteditems.selectedRowsData;
                if(data.length > 0){
                    $scope.vote = '';
                    $scope.selectedOpportunityId = data[0].CSCOpportunityID;
                    $scope.comments = '';
                }
                else {

                }
            }
        }
}]);

