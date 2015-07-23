'use strict';

// Datacollectors controller
angular.module('datacollectors').controller('ReviewBoardController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors) {
        $scope.authentication = Authentication;

        var data = [{
            "ID": 1,
            "OpportunityName": "Carrier Ent - D 123",
            "AccountName": "Carrier Enterprises",
            "CSCOpportunityID": "D-10170894",
            "ElBudget": "$5,2300",
            "ContractStartDate": "12/12/2016",
            "RequestedDataCenters": "QTS Chicago, QTS Miami",
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
                "ElBudget": "$7,4200",
                "ContractStartDate": "09/12/2015",
                "RequestedDataCenters": "Sentinel Chicago",
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
                "ElBudget": "$9,4200",
                "ContractStartDate": "09/12/2015",
                "RequestedDataCenters": "Sentinel Chicago",
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
                "ElBudget": "$3,4200",
                "ContractStartDate": "09/12/2017",
                "RequestedDataCenters": "QTS Chicago",
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
                width: 140
            },
                'OpportunityName',
                'AccountName', {
                    dataField: 'ElBudget',
                    caption: 'Elect. Budget',
                    width: 120
                }, {
                    dataField: 'RequestedDataCenters',
                    width: 180
                }, {
                    dataField: 'ContractStartDate',
                    dataType: 'date'
                }
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
            }
        }
}]);

