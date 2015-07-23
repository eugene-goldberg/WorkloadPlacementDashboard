'use strict';

// FileUploadController controller
angular.module('datacollectors').controller('FileUploadController',
    ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors', 'FileUploader',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors, FileUploader) {
        $scope.authentication = Authentication;

        $scope.uploadUrl = '';

        var url = '/api/files';

        var uploader = $scope.uploader = new FileUploader({
            //url: 'http://dctool-lnx.cloudapp.net:3001/api/files',
            //url:    url,
            //tabName: 'sheet1'
        });

        console.log('This is FileUploadController');

        function getEnvironment (){

                $http.get('/environment').success(function(response) {

                if(response.environment === 'test'){
                     url = 'http://localhost:3000/api/files';
                    initUploader(url);

                }
                if(response.environment === 'development'){
                  url = '/api/files';

                    initUploader(url);

                }
                //console.log('Current Environment is:  ' + $scope.currentEnvironment
                //+ '  so the uploadUrl should be:  ' + url);
            });
        }

        function initUploader(url){
            uploader.url = url;

            uploader.filters.push({
                name: 'customFilter',
                fn: function(item /*{File|FileLikeObject}*/, options) {
                    return this.queue.length < 10;
                }
            });

            uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
                //console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function(fileItem) {
                //console.info('onAfterAddingFile', fileItem);
                this.url = url;
                console.log('uploader.url is:  ' + url);
            };
            uploader.onAfterAddingAll = function(addedFileItems) {
                //console.info('onAfterAddingAll', addedFileItems);
            };

            uploader.onBeforeUploadItem = function(item) {
                angular.forEach( $scope.outputCategories, function( value, key ) {
                    selectedCategory = value.name;
                    item.formData.push({subjectCategory: selectedCategory});
                });
                angular.forEach( $scope.outputDataVersions, function( value, key ) {
                    selectedDataVersion = value.name;
                    item.formData.push({dataVersion: selectedDataVersion});
                });

                item.formData.push({
                    tabName: $scope.workspace.name,
                    originalDocumentName: $scope.originalDocumentName,
                    subject:    $scope.subject,
                    documentAuthor: $scope.documentAuthor,
                    dateDocumentProduced: $scope.dateDocumentProduced,
                    dateDocumentReceived: $scope.dateDocumentReceived,
                    documentSubmitter: $scope.documentSubmitter,
                    documentReviewer:   $scope.documentReviewer,
                    originalSource: $scope.originalSource,
                    dataFields: $scope.dataFields
                });
                console.info('onBeforeUploadItem', item);
                console.info('contentType:  ', $scope.contentType);
            };

            uploader.onProgressItem = function(fileItem, progress) {
                //console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function(progress) {
                //console.info('onProgressAll', progress);
            };
            uploader.onSuccessItem = function(fileItem, response, status, headers) {
                //console.info('onSuccessItem', fileItem, response, status, headers);
            };
            uploader.onErrorItem = function(fileItem, response, status, headers) {
                // console.info('onErrorItem', fileItem, response, status, headers);
                alert('UPLOAD ERROR!!!')
            };
            uploader.onCancelItem = function(fileItem, response, status, headers) {
                //console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function(fileItem, response, status, headers) {
                //console.info('onCompleteItem', fileItem, response, status, headers);
            };
            uploader.onCompleteAll = function() {
                console.info('onCompleteAll');

            };
        }

        getEnvironment();

        var selectedCategory;
        var selectedDataVersion;

        $scope.inputCategories = [
            {
                name: 'Cost Source Actuals'
            },
            {
                name: 'Cost Source Budget'
            },
            {
                name: 'Chart of Accounts'
            },
            {
                name: 'Cost Center Master'
            },
            {
                name: 'Headcount by Department Cost Center Labor'
            },
            {
                name: 'Fixed Asset Register'
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
                name: 'Vendors'
            },
            {
                name: 'SalesforceData',
                collectionName: 'SalesforceData'
            }
        ];

        $scope.dataVersionValues = [
            {
                name: '1'
            },
            {
                name: '2'
            },
            {
                name: '3'
            }
        ];
    }
]);
