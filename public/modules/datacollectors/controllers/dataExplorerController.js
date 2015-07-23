'use strict';

// Datacollectors controller
angular.module('datacollectors').controller('dataExplorerController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors) {
        $scope.authentication = Authentication;

        $scope.skip = 0;

        $scope.data = [];

        $scope.inputCategories = [
            {
                name: 'Cost Source Actuals',
                collectionName: 'Cost_Source_Actuals'
            },
            {
                name: 'Cost Source Budget',
                collectionName: 'Cost_Source_Budget'
            },
            {
                name: 'Chart of Accounts',
                collectionName: 'Chart_of_Accounts'
            },
            {
                name: 'Cost Center Master',
                collectionName: 'Cost_Center_Master'
            },
            {
                name: 'Headcount by Department Cost Center Labor',
                collectionName: 'Headcount_by_Department_Cost_Center_Labor'
            },
            {
                name: 'Fixed Asset Register',
                collectionName: 'Fixed_Asset_Register'

            },
            {
                name: 'AccountView Inventory',
                collectionName: 'AccountView_Inventory'

            },
            {
                name: 'DC Facilities',
                collectionName: 'DC_Facilities'

            },
            {
                name: 'GL accounts',
                collectionName: 'GL_accounts'

            },
            {
                name: 'NextGen data',
                collectionName: 'NextGen_data'

            },
            {
                name: 'Profit and Loss data',
                collectionName: 'Profit_and_Loss_data'

            },
            {
                name: 'Vendors',
                collectionName: 'Vendors'
            }
        ];

        $scope.dataVersionValues = [

        ];

        $scope.subjectList = [];

        var collectionName;

        var selectedCategory;

        var selectedDataVersion;

        $scope.collectionMetadata = {};

        $scope.collectionDatafields = [];

        $scope.getDataVersionsForSelectedCategory = function(data){
          console.log('Selected category:  ' + data.name);

            selectedCategory = data.name;
            angular.forEach( $scope.outputCategories, function( value, key ) {
                collectionName = value.collectionName;
            });
            $http({
                method: 'GET',
                url: '/collections_metadata/?' + collectionName
            }).success(function(data){
                // With the data succesfully returned, call our callback
                $scope.collectionMetadata = data;

                $scope.dataVersionValues = [];

                var propValue;
                for(var propName in data) {
                    propValue = data[propName];

                    var dataVersions = propValue.dataVersions;

                    dataVersions.forEach(function(version){
                        console.log('Data Version:  ' + version);

                        $scope.dataVersionValues.push({name: version});
                    });
                }
            }).error(function(){
                alert('error');
            });


            ////////////
            $http({
                method: 'GET',
                url: '/distinct_subject/?' + collectionName
            }).success(function(data){
                // With the data succesfully returned, call our callback
                data.forEach(function(subject){
                    $scope.subjectList.push({name:subject});
                });
            }).error(function(){
                alert('error');
            });


            /////////////

        };

        $scope.getSelectedDataVersion = function(data){
            console.log('Selected data version is:  ' + data.name);
            selectedDataVersion = data.name;
        };

        $scope.getData = function() {
            angular.forEach( $scope.outputCategories, function( value, key ) {
                collectionName = value.collectionName;
            });
            $scope.subjectList.forEach(function(subject){
                if(subject.ticked){
                    $scope.subject = subject.name;
                }
            });
            $http({
                method: 'GET',
                url: '/mongodata/?collectionName=' + collectionName + '&dataVersion=' + selectedDataVersion + '&subject=' + $scope.subject + '&' + $scope.skip
            }).success(function(data){
                // With the data succesfully returned, call our callback
                $scope.skip = $scope.skip + 500;
                $scope.data = $scope.data.concat(data);
                var fields = data[0].DataFields;

                var fieldList = [];

                fieldList = fields.split(',');

                fieldList.forEach(function(field){
                    $scope.collectionDatafields.push({dataField: field, caption: field, visible: false});
                });
            }).error(function(){
                alert('error');
            });
        };

        function resetExplorerPage(){
            $scope.subjectList = [];
            $scope.dataVersionValues = [];
            $scope.data = [];
            $scope.collectionDatafields = [];
        }

        $scope.$watch(function(scope) {return  $scope.outputCategories },
            function(newValue, oldValue) {
                if(newValue[0]){
                    console.log('new value:  ' + newValue[0].name);
                }
                if(newValue[0]){
                    resetExplorerPage();
                }
            }
        );

        $scope.gridOptions = {
            bindingOptions: {
                dataSource: 'data',
                columns: 'collectionDatafields'
            },
            "export": {
                enabled: true,
                fileName: "DataExport",
                allowExportSelectedData: true
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
            }
        };
    }
]);
