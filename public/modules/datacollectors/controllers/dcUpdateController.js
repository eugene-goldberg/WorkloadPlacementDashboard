'use strict';

angular.module('datacollectors').controller('DcUpdateController',
    ['$scope', '$http', '$stateParams', '$location',
        'Authentication', 'Datacollectors', 'FileUploader','$rootScope','$state',
        function($scope, $http, $stateParams, $location, Authentication,
                 Datacollectors, FileUploader,$rootScope,$state) {

            console.log('This is dcUpdateController');

            //console.log('selectedDcName: ' + $scope.selectedDcName[0].name);

            function initDcList(){
                $http.get('/dc_inventory').success(function(response) {
                    console.log('found ' + response.length + ' records for dc inventory');
                    response.forEach(function(record){
                        $scope.dcNames.push({name: record.DataCenterName,dcRegion: record.DcRegion, dcAddress:record.DcAddress, country: record.DcCountry, siteCode: record.DcSiteCode});
                    });
                });
            }

            initDcList();

            $scope.buList = [
                {
                    name: 'GIS'
                },
                {
                    name: 'GBS'
                },
                {
                    name: 'EBG'
                },
                {
                    name: 'NPS'
                }
            ];

            $scope.tenancyTypes = [
                {
                    name: 'Multi'
                },
                {
                    name: 'Single'
                }
            ];

            $scope.contractTypes = [
                {
                    name: "Leased"
                },
                {
                    name: "Owned"
                },
                {
                    name: "CoLo"
                }

            ];

            $scope.workspaces =
                [
                    { id: 1, name: "dc" ,active:true  },
                    { id: 2, name: 'dc-2' ,active:false  }
                ];

            $scope.dcNames = [];

            $scope.dcRegions = [
                {
                    name: "Americas"
                },
                {
                    name: "AMEA"
                },
                {
                    name: "India "
                },
                {
                    name: "Nordics"
                },
                {
                    name: "UK&I"
                },
                {
                    name: 'Australia & NZ'
                },
                {
                    name: 'SW Europe'
                },
                {
                    name: 'C&E EUROPE'
                }
            ];

            $scope.overallStrategies = [
                {
                    name: "Close"
                },
                {
                    name: "Move"
                },
                {
                    name: "Maintain"
                },
                {
                    name:   "Grow"
                }

            ];

            $scope.datacenterTypes = [
                {
                    name: "CoLo"
                },
                {
                    name: "Leased"
                },
                {
                    name:   "Owned"
                }
            ];

            $scope.dcTiers = [
                {
                    name:   "Critical"
                },
                {
                    name: "Commodity"
                }
            ];

            $scope.strategicNatures = [
                {
                    name: "GIS-Multi"
                },
                {
                    name: "GIS-Single"
                },
                {
                    name: "GIS-Cloud"
                },
                {
                    name:   "NPS"
                }
            ];

            $scope.certifications = [
                {
                    name: "ITAR"
                },
                {
                    name: "SSAE 16"
                },
                {
                    name: "ISAE 3402"
                },
                {
                    name:   "ISO2000"
                },
                {
                    name:   "ISO27001"
                }
            ];

            $scope.networkNodeTypes = [
                {
                    name: "Gain"
                },
                {
                    name:   "Super-Gain"
                },
                {
                    name: "CGEN"
                }
            ];

            $scope.workloadList = [
                {
                    name: 'AS/400'
                },
                {
                    name: 'Biz Cloud'
                },
                {
                    name: 'Biz Cloud HC'
                },
                {
                    name: 'Cloud Compute'
                },
                {
                    name: 'Cyber'
                },
                {
                    name: 'LAN'
                },
                {
                    name: 'Mainframe'
                },
                {
                    name: 'My Workstyle'
                },
                {
                    name: 'Service Management'
                },
                {
                    name: 'Storage as a Service'
                },
                {
                    name: 'UCaaS'
                },
                {
                    name: 'Unix farm'
                },
                {
                    name: 'WAN'
                },
                {
                    name: 'Windows farm'
                }
            ];

            $scope.selectedDcName=[{}];

            function resetUpdateForm(){
                $scope.dcNames.forEach(function(dc){
                    dc.ticked = false;
                });
                $scope.dcRegions.forEach(function(region){
                    region.ticked = false;
                });
                $scope.dcTiers.forEach(function(tier){
                   tier.ticked = false;
                });
                $scope.buList.forEach(function(bu){
                   bu.ticked = false;
                });
                $scope.workloadList.forEach(function(workload){
                   workload.ticked = false;
                });
                $scope.tenancyTypes.forEach(function(type){
                   type.ticked = false;
                });
                $scope.contractTypes.forEach(function(type){
                   type.ticked = false;
                });
                $scope.networkNodeTypes.forEach(function(node){
                   node.ticked = false;
                });
                $scope.strategicNatures.forEach(function(nature){
                   nature.ticked = false;
                });
                $scope.datacenterTypes.forEach(function(type){
                   type.ticked = false;
                });
                $scope.overallStrategies.forEach(function(strategy){
                   strategy.ticked = false;
                });
                $scope.dcTier = '';
                $scope.dcSiteCode = '';
                $scope.dcAddress = '';
                $scope.dcCountry = '';

                $scope.leaseEnds = '';
                $scope.kwLeasedUtilized = '';
                $scope.annualCost = '';
                $scope.$kWL = '';
                $scope.cscSecurityLead = '';
                $scope.dcManager = '';
                $scope.dcSecurityLead = '';
                $scope.dcRegionalManager = '';
                $scope.buildDate = '';
                $scope.vendor = '';
                $scope.valueOfUtilization = '';

                $scope.dcProvider = '';
                $scope.dcProviderContact = '';
                $scope.annualDirectLeaseCost = '';

                $scope.annualTaxBill = '';

                $scope.contractEndDate = '';

                $scope.sqFtContracted = '';
                $scope.sqFtReservedForNewBusiness = '';
                $scope.keyAccounts = '';

                $scope.sqFtPctContracted = '';
                $scope.kwCapacity = '';
                $scope.kwContracted = '';
                $scope.kwReservedForNewBusiness = '';
                $scope.kwPctContracted = '';
                $scope.kw$PerHour = '';
                $scope.operationsCost = '';
                $scope.annualPowerCost = '';
                $scope.dcOfferingGm = '';

                $scope.consolidationStrategy = '';
                $scope.sqFtTotal = '';
                $scope.pctUtilization = '';
                $scope.sqFtRaised = '';
                $scope.certifications = '';
            }

            function getPlaycardsData(dcName) {
                $http({
                    method: 'GET',
                    url: '/playcards_data/?dcName=' + dcName
                }).success(function(data){
                    if(data !== undefined){
                        if(data[0] !== undefined){
                                $scope.dcName = data[0].DataCenterName;
                                $scope.dcTier = data[0].DcTier;
                                $scope.dcSiteCode = data[0].DcSiteCode;
                                $scope.dcAddress = data[0].DcAddress;
                                $scope.dcCountry = data[0].DcCountry;

                                $scope.leaseEnds = data[0].LeaseEnds;
                                $scope.kwLeasedUtilized =    data[0].KwLeasedUtilized;
                                $scope.annualCost = data[0].AnnualCost;
                                $scope.$kWL =   data[0].KWL;
                                $scope.cscSecurityLead = data[0].CscSecurityLead;
                                $scope.dcManager =  data[0].DcManager;
                                //$scope.dcSecurityLead = data[0].CscSecurityLead;
                                $scope.dcRegionalManager =   data[0].DcRegionalHead;
                                $scope.buildDate =  data[0].BuildDate;
                                $scope.vendor = data[0].Vendor;
                                $scope.valueOfUtilization = data[0].ValueOfUtilization;
                                //$scope.dcAddress =  data[0].DatacenterAddress;

                                $scope.dcProvider = data[0].DcProvider;
                                $scope.dcProviderContact =    data[0].DcProviderContact;
                                $scope.annualDirectLeaseCost =  data[0].AnnualDirectLeaseCost;

                                $scope.annualTaxBill = data[0].AnnualTaxBill;

                                $scope.contractEndDate = data[0].ContractEndDate;

                                $scope.sqFtContracted = data[0].SqFtContracted;
                                $scope.sqFtReservedForNewBusiness = data[0].SqFtReservedForNewBusiness;


                                $scope.sqFtPctContracted = data[0].SqFtPctContracted;
                                $scope.kwCapacity = data[0].KwCapacity;
                                $scope.kwContracted = data[0].KwContracted;
                                $scope.kwReservedForNewBusiness = data[0].KwReservedForNewBusiness;
                                $scope.kwPctContracted = data[0].KwPctContracted;
                                $scope.kw$PerHour = data[0].Kw$PerHour;
                                $scope.operationsCost = data[0].OperationsCost;
                                $scope.annualPowerCost = data[0].AnnualPowerCost;
                                $scope.dcOfferingGm = data[0].DcOfferingGm;



                                if(data[0].DcTier !== undefined){
                                    $scope.dcTiers.forEach(function(tier){
                                        if(tier.name === data[0].DcTier){
                                            tier.ticked = true;
                                        }
                                    })
                                }
                            else {
                                    $scope.dcTiers.forEach(function(tier){
                                        if(tier.name === 'Critical'){
                                            tier.ticked = true;
                                        }
                                    })
                                }

                                if(data[0].ConsolidationStrategy !== undefined){
                                    $scope.consolidationStrategy =  data[0].ConsolidationStrategy;
                                }

                            if(data[0].KeyAccounts !== undefined){
                                    $scope.keyAccounts = data[0].KeyAccounts;
                            }

                                $scope.sqFtCapacity =  data[0].SqFtCapacity;
                                $scope.sqFtRaised = data[0].SqFtRaised;
                                $scope.pctUtilization = data[0].PctUtilization;

                                $scope.selectedCertifications = data[0].Certifications;

                                //selectedCerts.forEach(function(cert){
                                //    $scope.certifications.forEach(function(c){
                                //        if(c.name === cert){
                                //            c.ticked = true;
                                //        }
                                //    })
                                //});
                            if(data[0].ContractTypes !== undefined){
                                var selectedContracts = data[0].ContractTypes.split(',');
                                if(selectedContracts.length > 0){
                                    selectedContracts.forEach(function(contract){
                                        $scope.contractTypes.forEach(function(c){
                                            if(c.name === contract){
                                                c.ticked = true;
                                            }
                                        })
                                    });
                                }
                            }



                                    $scope.tenancyTypes.forEach(function(type){
                                        if(type.name === data[0].TenancyTypes){
                                            type.ticked = true;
                                        }
                                    });

                            var selectedNetworkNodes = data[0].NetworkNodeTypes.split(',');
                            if(selectedNetworkNodes.length > 0){
                                selectedNetworkNodes.forEach(function(node){
                                    $scope.networkNodeTypes.forEach(function(c){
                                        if(c.name === node){
                                            c.ticked = true;
                                        }
                                    })
                                });
                            }

                            var strategicNatures = data[0].StrategicNaturesOfDc.split(',');
                            if(strategicNatures.length > 0){
                                strategicNatures.forEach(function(nature){
                                    $scope.strategicNatures.forEach(function(c){
                                        if(c.name === nature){
                                            c.ticked = true;
                                        }
                                    })
                                });
                            }

                            if(data[0].DataCenterTypes){
                                var dcTypes = data[0].DataCenterTypes.split(',');
                                if(dcTypes.length > 0){
                                    dcTypes.forEach(function(dctype){
                                        $scope.datacenterTypes.forEach(function(c){
                                            if(c.name === dctype){
                                                c.ticked = true;
                                            }
                                        })
                                    });
                                }
                            }


                            //$scope.dcRegions.forEach(function(region){
                            //    if(region.name === data[0].Region){
                            //        region.ticked = true;
                            //    }
                            //});

                            var overallStrategies = data[0].OverallStrategies.split(',');
                            if(overallStrategies.length > 0){
                                overallStrategies.forEach(function(strategy){
                                    $scope.overallStrategies.forEach(function(c){
                                        if(c.name === strategy){
                                            c.ticked = true;
                                        }
                                    })
                                });
                            }

                            $scope.buList.forEach(function(bu){
                                if(bu.name === data[0].CscBu){
                                    bu.ticked = true;
                                }
                            });

                            var workloads = data[0].Workloads.split(',');
                            if(workloads.length > 0){
                                workloads.forEach(function(workload){
                                    $scope.workloadList.forEach(function(wrk){
                                        if(wrk.name === workload){
                                            wrk.ticked = true;
                                        }
                                    })
                                })
                            }
                        }
                    }

                }).error(function(){
                    alert('error');
                });


            }

            $scope.$watch(function(scope) {return  $scope.selectedDcName },
                function(newValue, oldValue) {
                    if(newValue[0]){
                        console.log('new value:  ' + newValue[0].name);
                    }

                    if(newValue[0]){
                        $scope.$parent.selectedName = newValue[0].name;
                            $scope.dcCountry=newValue[0].country;
                            $scope.dcSiteCode = newValue[0].siteCode;

                            $scope.dcTier = newValue[0].DcTier;

                        var matchingDcRecord = $scope.dcNames.filter(function (entry) { return entry.name === newValue[0].name; });

                        //for(var prop in matchingDcRecord){
                        //    console.log('matchingRecord prop name: ' + prop + '  prop value: ' + matchingDcRecord[prop]);
                        //}
                        //
                        //console.log('matching record[0].dcRegion:  ' + matchingDcRecord[0].dcRegion);

                        if(matchingDcRecord){
                            if(matchingDcRecord.length > 0){
                                $scope.dcRegions.forEach(function(region){
                                    if(region.name === matchingDcRecord[0].dcRegion){
                                        region.ticked = true;
                                    }
                                });

                                $scope.dcAddress = matchingDcRecord[0].dcAddress;
                            }

                        }
                            getPlaycardsData(newValue[0].name);
                    }
                }
            );

            $scope.postUpdate = function(){
                console.log('playcard update  ');
                var postData = {
                    DataCenterName: $scope.selectedDcName,
                    DcRegion: $scope.selectedDcRegion,
                    DcSiteCode: $scope.dcSiteCode,
                    DcAddress: $scope.dcAddress,
                    DcCountry: $scope.dcCountry,

                    StrategicNaturesOfDc: $scope.selectedStrategicNatures,
                    AnnualDirectLeaseCost: $scope.annualDirectLeaseCost,
                    DataCenterTypes: $scope.selectedDatacenterTypes,
                    TenancyTypes: $scope.selectedTenancyTypes,
                    NetworkNodeTypes: $scope.selectedNetworkNodeTypes,
                    KeyAccounts: $scope.keyAccounts,
                    SqFtCapacity: $scope.sqFtCapacity,
                    SqFtRaised: $scope.sqFtRaised,
                    PctUtilization: $scope.pctUtilization,
                    DcTier: $scope.selectedDcTier,
                    ContractTypes: $scope.selectedContractTypes,
                    LeaseEnds: $scope.leaseEnds,
                    KwLeasedUtilized: $scope.kwLeasedUtilized,
                    AnnualCost: $scope.annualCost,
                    $kWL: $scope.$kWL,
                    Certifications: $scope.selectedCertifications,
                    DcManager:  $scope.dcManager,
                    DcRegeonalHead: $scope.dcRegionalManager,
                    CscSecurityLead:    $scope.cscSecurityLead,
                    ConsolidationStrategy:  $scope.consolidationStrategy,
                    OverallStrategies:    $scope.selectedOverallStrategies,

                    BuildDate:  $scope.buildDate,
                    Vendor: $scope.vendor,
                    ValueOfUtilization: $scope.valueOfUtilization,
                    DatacenterAddress:  $scope.dcAddress,
                    DcProvider: $scope.dcProvider,
                    DcProviderContact:  $scope.dcProviderContact,
                    AnnualTaxBill: $scope.annualTaxBill,
                    ContractEndDate: $scope.contractEndDate,
                    CscBu: $scope.selectedBu,
                    SqFtContracted: $scope.sqFtContracted,
                    SqFtReservedForNewBusiness: $scope.sqFtReservedForNewBusiness,
                    Workloads: $scope.selectedWorkloads,

                    SqFtPctContracted:  $scope.sqFtPctContracted,
                    KwCapacity:   $scope.kwCapacity,
                    KwContracted:   $scope.kwContracted,
                    KwReservedForNewBusiness:    $scope.kwReservedForNewBusiness,
                    KwPctContracted:    $scope.kwPctContracted,
                    Kw$PerHour:    $scope.kw$PerHour,
                    OperationsCost: $scope.operationsCost,
                    AnnualPowerCost:    $scope.annualPowerCost,
                    DcOfferingGm:   $scope.dcOfferingGm
                };
                var json = angular.toJson(postData);
                $http.post('/playcard_update', json)
                    .success(function(data, status, headers, config) {
                    //$state.go('view-playcard');
                        resetUpdateForm();
                        alert('Playcard update successful');
                }).
                    error(function(data, status, headers, config) {
                        alert('Error while updating Playcard data');
                    });
            };

            var setAllInactive = function() {
                angular.forEach($scope.workspaces, function(workspace) {
                    workspace.active = false;
                });
            };

            $scope.activeWorkspaceSheetName = function(){
                $scope.workspaces.forEach(function(workspace) {
                    if(workspace.active){
                        return workspace.name;
                    }
                });
            };

            var addNewWorkspace = function() {
                var id = $scope.workspaces.length + 1;
                $scope.workspaces.push({
                    id: id,
                    name:  "dc-" + id,
                    active: true
                });
            };

            $scope.workspaces =
                [
                    { id: 1, name: "dc" ,active:true  },
                    { id: 2, name: 'dc-2' ,active:false  }
                ];

            $scope.addWorkspace = function () {
                setAllInactive();
                addNewWorkspace();
            };

            $scope.removeWorkspace = function() {
                angular.forEach($scope.workspaces, function(workspace) {
                    if(workspace.active){
                        var index = $scope.workspaces.indexOf(workspace);
                        console.log('Active Workspace id: ' + index);
                        $scope.workspaces.splice(index,1);
                    }
                });
            };
        }
    ]);

