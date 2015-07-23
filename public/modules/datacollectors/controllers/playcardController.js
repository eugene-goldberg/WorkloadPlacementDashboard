'use strict';

angular.module('datacollectors').controller('PlaycardController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Datacollectors',
    function($scope, $http, $stateParams, $location, Authentication, Datacollectors) {
        $scope.authentication = Authentication;

        $scope.playcards = [];

        $scope.selectedDcName=[{}];

        $scope.playcard = {
            dcName: "",
            keyAccounts: [],
            workloads: [],
            sqFtCapacity: '',
            sqFtContracted: '',
            sqFtPctContracted: '',
            sqFtReservedForNewBusiness: '',
            pctContracted: '',
            dcTier: "",
            contractType: "",
            leaseEnds: "",
            kwCapacity: '',
            kwContracted: '',
            kwReservedForNewBusiness: '',
            kwPctContracted: '',
            kw$PerHour: '',
            operationsCost: '',
            annualPowerCost: '',
            strategicNatureOfDc: '',
            dcOfferingGm: '',
            kWlUtil:    "",
            annualCost: "",
            $kWl:   "",
            certifications: "",
            dcManager:  "",
            dcSecurityLead: "",
            regionalHead:   "",
            buildDate:  "",
            vendor: "",
            valueOfUtilization: "",
            dcRegion: '',
            dcAddress:  "",
            dcProvider: "",
            dcProviderContact:    "",
            consolidationStrategy:  [],
            overallStrategy: [],
            annualDirectLeaseCost:  "",
            contractEndDate: '',
            cscBu: '',
            sqPctContracted: '',
            totalAnnualCost: '',
            sqFtTotal:  "",
            sqFtRaised: "",
            pctUtilization: "",
        };

        function getPlaycardsData(dcName) {
            $http({
                method: 'GET',
                url: '/playcards_data/?dcName=' + dcName
            }).success(function(data){
                $scope.playcards = data;
                {
                    $scope.playcard.dcName = $scope.playcards[0].DataCenterName;
                    $scope.playcard.dcAddress =  $scope.playcards[0].DcAddress;
                    $scope.playcard.strategicNatureOfDc = $scope.playcards[0].StrategicNaturesOfDc;
                    if(data[0].KeyAccounts !== undefined){
                        if(data[0].KeyAccounts.length > 0){
                            $scope.playcard.keyAccounts = data[0].KeyAccounts.split(",");
                        }
                        else {
                            $scope.playcard.keyAccounts = data[0].KeyAccounts;
                        }
                        console.log('playcard.keyAccounts: ' + $scope.playcard.keyAccounts);
                    }

                    if(data[0].Workloads !== undefined){
                        if(data[0].Workloads.length > 0){
                            $scope.playcard.workloads = data[0].Workloads.split(",");
                        }
                        else {
                            $scope.playcard.workloads = data[0].Workloads;
                        }
                        console.log('playcard.workloads: ' + $scope.playcard.workloads);
                    }

                    $scope.playcard.sqFtCapacity =  $scope.playcards[0].SqFtCapacity;
                    $scope.playcard.sqFtPctContracted =  $scope.playcards[0].SqFtPctContracted;
                    $scope.playcard.sqFtRaised = $scope.playcards[0].SqFtRaised;
                    $scope.playcard.pctUtilization = $scope.playcards[0].PctUtilization;
                    $scope.playcard.dcTier = $scope.playcards[0].DcTier;
                    $scope.playcard.contractType = $scope.playcards[0].ContractTypes;
                    $scope.playcard.leaseEnds = $scope.playcards[0].LeaseEnds;
                    $scope.playcard.annualDirectLeaseCost =  $scope.playcards[0].AnnualDirectLeaseCost;
                    $scope.playcard.$kWl =   $scope.playcards[0].KWL;
                    $scope.playcard.certifications = $scope.playcards[0].Certifications;
                    $scope.playcard.dcRegion =  $scope.playcards[0].DcRegion;
                    $scope.playcard.dcManager =  $scope.playcards[0].DcManager;
                    $scope.playcard.regionalHead =   $scope.playcards[0].DcRegionalHead;
                    $scope.playcard.dcSecurityLead = $scope.playcards[0].CscSecurityLead;
                    $scope.playcard.consolidationStrategy =  $scope.playcards[0].ConsolidationStrategy.split(",");
                    $scope.playcard.overallStrategies = $scope.playcards[0].OverallStrategies.split(",");
                    $scope.playcard.buildDate =  $scope.playcards[0].BuildDate;
                    $scope.playcard.vendor = $scope.playcards[0].Vendor;
                    $scope.playcard.valueOfUtilization = $scope.playcards[0].ValueOfUtilization;
                    $scope.playcard.dcProvider = $scope.playcards[0].DcProvider;
                    $scope.playcard.dcProviderContact =    $scope.playcards[0].DcProviderContact;
                    $scope.playcard.kwCapacity = $scope.playcards[0].KwCapacity;
                    $scope.playcard.kwContracted = $scope.playcards[0].KwContracted;
                    $scope.playcard.kwReservedForNewBusiness = $scope.playcards[0].KwReservedForNewBusiness;
                    $scope.playcard.kwPctContracted = $scope.playcards[0].KwPctContracted;
                    $scope.playcard.kw$PerHour = $scope.playcards[0].Kw$PerHour;
                    $scope.playcard.operationsCost = $scope.playcards[0].OperationsCost;
                    $scope.playcard.annualPowerCost = $scope.playcards[0].AnnualPowerCost;
                    $scope.playcard.dcOfferingGm = $scope.playcards[0].DcOfferingGm;
                    $scope.playcard.dcRegion = $scope.playcards[0].DcRegion;
                    $scope.playcard.totalAnnualCost = $scope.playcards[0].AnnualCost;
                }
            }).error(function(){
                alert('error');
            });
        }

        $scope.dcNames = [];

        function initDcList(){
            $http.get('/playcards_dc_list').success(function(response) {
                //console.log('found ' + response.length + ' records for datacenter-listing');
                response.forEach(function(record){
                    $scope.dcNames.push({name: record.DataCenterName});
                });
            });
        }

        $scope.$watch(function(scope) {return  $scope.selectedDcName },
            function(newValue, oldValue) {
                if(newValue){
                    if(newValue[0]) {
                        if(newValue[0].name) {
                            getPlaycardsData(newValue[0].name);
                        }
                    }
                }
            }
        );

        initDcList();
    }
]);

